// audio.js — motor de audio. Corrige el bug del botón "Detener": antes se programaban todas
// las notas por adelantado con tiempos absolutos de Web Audio, así que limpiar los setTimeout
// de la interfaz no silenciaba el sonido ya en curso. Ahora cada nodo activo queda registrado
// y stopAll() lo apaga de inmediato (fade rápido + parada real de todos sus osciladores/ruido),
// además de invalidar callbacks pendientes con un contador de "generación".
//
// Motor de síntesis realista: en vez de un único oscilador "pitido" por nota, cada timbre
// combina varias fuentes (armónicos, filtros de formante, transitorios de ruido) con una
// envolvente ADSR propia, para que las notas guía suenen a instrumento/voz real y no a beep
// de juguete. Todo sigue siendo síntesis local (Web Audio API), sin muestras externas.

import { midiToFreq, freqToMidiExact } from './pitch.js';
import { intervalToSolfeggio } from './exercises.js';

export class AudioEngine{
  constructor(){
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);
    this.timbre = 'voz';
    this._activeNodes = new Set();
    this._scheduledTimers = [];
    this._gen = 0;
    this._metroTimer = null;
    this.metronomeOn = false;
    this._followOsc = null; this._followGain = null; this._followTimbreGain = null;
    this._noiseBuffer = this._createNoiseBuffer();

    // Muestras reales de piano (Salamander Grand Piano, Yamaha C5, CC BY 3.0 — ver
    // assets/piano-samples/CREDITS.md). Se cargan bajo demanda la primera vez que se
    // necesitan; mientras tanto se usa el piano sintetizado como respaldo automático.
    this._pianoSampleNames = ['A0','C1','Ds1','Fs1','A1','C2','Ds2','Fs2','A2','C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4','C5','Ds5','Fs5','A5','C6','Ds6','Fs6','A6','C7','Ds7','Fs7','A7','C8'];
    this._pianoSampleBaseMidi = 21; // A0, espaciadas cada 3 semitonos (terceras menores)
    this._pianoBuffers = null;
    this._pianoLoading = null;
  }

  async resume(){ if(this.ctx.state === 'suspended') await this.ctx.resume(); }
  now(){ return this.ctx.currentTime; }

  /** Buffer de ruido blanco compartido (2s, en loop cuando hace falta ruido continuo). */
  _createNoiseBuffer(){
    const dur = 2;
    const buf = this.ctx.createBuffer(1, Math.max(1, Math.floor(this.ctx.sampleRate * dur)), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }
  _noiseSource(loop = false){
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    src.loop = loop;
    if(loop){ src.loopStart = 0; src.loopEnd = this._noiseBuffer.duration; }
    return src;
  }
  /** Registra un nodo "detenible" (con método stop(now)) para que stopAll() pueda cortarlo. */
  _registerNode(stopFn, selfCleanupMs){
    const node = { stop: stopFn };
    this._activeNodes.add(node);
    if(selfCleanupMs != null){
      setTimeout(() => { this._activeNodes.delete(node); }, selfCleanupMs);
    }
    return node;
  }
  _fadeStopGain(gainNode, now, tail = 0.03){
    try{
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0.0001, now + tail);
    }catch{ /* nodo ya pudo haber terminado */ }
  }

  /** Clic corto de confirmación de UI: percusivo (ruido filtrado), no un pitido tonal. */
  clickTone(){
    const now = this.now();
    const noise = this._noiseSource(false);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 2.2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.5, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    noise.connect(bp); bp.connect(g); g.connect(this.master);
    noise.start(now); noise.stop(now + 0.07);
  }

  /** Tic de metrónomo: clic percusivo (ruido pasa-banda) + cuerpo tonal corto tipo "clac"
   * mecánico, en vez del pitido cuadrado anterior. El acento suena más agudo y más fuerte. */
  metronomeTick(accent = false){
    const now = this.now();

    const noise = this._noiseSource(false);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = accent ? 3200 : 2100;
    bp.Q.value = accent ? 3.2 : 2.4;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.exponentialRampToValueAtTime(accent ? 0.9 : 0.55, now + 0.002);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + (accent ? 0.09 : 0.06));
    noise.connect(bp); bp.connect(ng); ng.connect(this.master);
    noise.start(now); noise.stop(now + 0.1);

    const o = this.ctx.createOscillator(); const og = this.ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(accent ? 1700 : 1050, now);
    o.frequency.exponentialRampToValueAtTime(accent ? 850 : 520, now + 0.06);
    og.gain.setValueAtTime(0.0001, now);
    og.gain.exponentialRampToValueAtTime(accent ? 0.32 : 0.18, now + 0.003);
    og.gain.exponentialRampToValueAtTime(0.0001, now + (accent ? 0.08 : 0.055));
    o.connect(og); og.connect(this.master);
    o.start(now); o.stop(now + 0.09);
  }

  startMetronome(bpm){
    this.stopMetronome();
    this.metronomeOn = true;
    let beat = 0;
    const interval = 60000 / bpm;
    const tick = () => {
      if(!this.metronomeOn) return;
      this.metronomeTick(beat % 4 === 0);
      beat++;
      this._metroTimer = setTimeout(tick, interval);
    };
    tick();
  }

  stopMetronome(){
    this.metronomeOn = false;
    if(this._metroTimer) clearTimeout(this._metroTimer);
    this._metroTimer = null;
  }

  /** Llamado desde la UI cuando el usuario elige el timbre "Piano" — dispara la carga en
   * segundo plano sin bloquear. Es seguro llamarlo varias veces (no vuelve a descargar). */
  preloadPiano(){ this._loadPianoSamples(); }

  _loadPianoSamples(){
    if(this._pianoBuffers) return Promise.resolve(this._pianoBuffers);
    if(this._pianoLoading) return this._pianoLoading;
    this._pianoLoading = Promise.all(this._pianoSampleNames.map(async (name) => {
      const res = await fetch(`assets/piano-samples/${name}.mp3`);
      if(!res.ok) throw new Error(`No se pudo cargar assets/piano-samples/${name}.mp3`);
      const arrayBuffer = await res.arrayBuffer();
      return await this.ctx.decodeAudioData(arrayBuffer);
    })).then(buffers => {
      this._pianoBuffers = buffers;
      this._pianoLoading = null;
      return buffers;
    }).catch(err => {
      console.warn('No se pudieron cargar las muestras reales de piano; se usará el piano sintetizado como respaldo.', err);
      this._pianoLoading = null;
      return null;
    });
    return this._pianoLoading;
  }

  /** Elige entre la muestra real más cercana (si ya está cargada) o el piano sintetizado
   * de respaldo, y dispara la carga en segundo plano si todavía no ha empezado. */
  _pianoTone(freq, start, dur, endFreq){
    if(this._pianoBuffers){
      return this._pianoSampleTone(freq, start, dur, endFreq);
    }
    this._loadPianoSamples();
    return this._pianoSynthTone(freq, start, dur, endFreq);
  }

  /** Reproduce la nota con la grabación real más cercana (a lo sumo a 1.5 semitonos de
   * distancia, ya que las muestras están cada 3 semitonos) y afina el resto con
   * playbackRate — la misma técnica que usa cualquier sampler de piano profesional. */
  _pianoSampleTone(freq, start, dur, endFreq){
    const midi = freqToMidiExact(freq);
    const idx = Math.max(0, Math.min(this._pianoBuffers.length - 1, Math.round((midi - this._pianoSampleBaseMidi) / 3)));
    const sampleMidi = this._pianoSampleBaseMidi + idx * 3;
    const buffer = this._pianoBuffers[idx];
    if(!buffer) return this._pianoSynthTone(freq, start, dur, endFreq);

    const rate = Math.pow(2, (midi - sampleMidi) / 12);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.setValueAtTime(rate, start);
    if(endFreq && endFreq !== freq){
      const midiEnd = freqToMidiExact(endFreq);
      const rateEnd = Math.pow(2, (midiEnd - sampleMidi) / 12);
      src.playbackRate.linearRampToValueAtTime(rateEnd, start + dur);
    }

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(1.0, start + 0.008); // evita "clic" al arrancar la muestra
    const releaseStart = start + Math.max(dur, 0.15);
    const releaseTail = 0.85; // deja que el piano se apague de forma natural, como al soltar la tecla
    g.gain.setValueAtTime(1.0, releaseStart);
    g.gain.exponentialRampToValueAtTime(0.0001, releaseStart + releaseTail);
    src.connect(g); g.connect(this.master);

    const stopAt = releaseStart + releaseTail + 0.05;
    src.start(start);
    try{ src.stop(stopAt); }catch{}

    const node = this._registerNode((now) => {
      this._fadeStopGain(g, now, 0.04);
      try{ src.stop(now + 0.05); }catch{}
    }, (stopAt - start + 0.3) * 1000);
    src.onended = () => { this._activeNodes.delete(node); };
    return node;
  }

  /** Punto de entrada: elige el sintetizador/muestreador según el timbre elegido y lo
   * registra como "activo" (para que stopAll() pueda cortarlo aunque ya esté sonando). */
  synthTone(freq, when, dur, endFreq = null){
    const start = this.now() + when;
    switch(this.timbre){
      case 'piano': return this._pianoTone(freq, start, dur, endFreq);
      case 'voz':   return this._voiceTone(freq, start, dur, endFreq);
      default:      return this._basicTone(freq, start, dur, endFreq); // sine / triangle / sawtooth
    }
  }

  /** Oscilador único clásico, pero con envolvente ADSR (ataque-caída-sostén-suelta) en vez del
   * simple triángulo lineal de antes, para que ya no suene a "beep" plano. */
  _basicTone(freq, start, dur, endFreq){
    const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
    osc.type = this.timbre;
    osc.frequency.setValueAtTime(freq, start);
    if(endFreq && endFreq !== freq){
      osc.frequency.linearRampToValueAtTime(endFreq, start + dur);
    }
    const atk = Math.min(0.02, dur * 0.18);
    const dec = Math.min(0.05, dur * 0.2);
    const rel = Math.min(0.06, dur * 0.28);
    const susAt = Math.max(start + atk + dec, start + dur - rel);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(0.85, start + atk);
    g.gain.linearRampToValueAtTime(0.62, start + atk + dec);
    g.gain.setValueAtTime(0.62, susAt);
    g.gain.linearRampToValueAtTime(0.0001, start + dur);
    osc.connect(g); g.connect(this.master);
    osc.start(start); osc.stop(start + dur + 0.03);
    const node = this._registerNode((now) => { this._fadeStopGain(g, now, 0.03); try{ osc.stop(now + 0.04); }catch{} });
    osc.onended = () => { this._activeNodes.delete(node); };
    return node;
  }

  /** Piano sintetizado (respaldo): se usa mientras las muestras reales terminan de cargar,
   * o si por algún motivo no se pueden cargar (ej. sin conexión la primera vez). Modelado
   * físico simplificado:
   *  - Cada armónico se sintetiza con DOS osciladores "cuerda" ligeramente desafinados entre sí
   *    (como las cuerdas dobles/triples reales de un piano), lo que genera el "batido" (beating)
   *    natural que hace que un piano real nunca suene perfectamente estático.
   *  - Inarmonicidad dependiente del registro: las notas graves (cuerdas más gruesas) se
   *    desvían más de la serie armónica pura que las agudas, igual que en un piano acústico.
   *  - Cada armónico decae a su propio ritmo (los agudos se apagan antes) y el conjunto pasa
   *    por un filtro paso-bajo cuya frecuencia de corte baja con el tiempo, así el tono se va
   *    "oscureciendo" a medida que suena, como el brillo real de un piano al apagarse.
   *  - Transitorio de martillo (ruido de fieltro) + resonancia de tabla armónica (cola de ruido
   *    grave muy tenue) para dar cuerpo y textura de instrumento acústico real. */
  _pianoSynthTone(freq, start, dur, endFreq){
    const harmonics = [
      { n: 1, amp: 1.00, decay: 1.05 },
      { n: 2, amp: 0.62, decay: 0.85 },
      { n: 3, amp: 0.40, decay: 0.68 },
      { n: 4, amp: 0.26, decay: 0.54 },
      { n: 5, amp: 0.17, decay: 0.44 },
      { n: 6, amp: 0.11, decay: 0.36 },
      { n: 7, amp: 0.07, decay: 0.30 },
      { n: 8, amp: 0.045, decay: 0.25 },
    ];
    const noteDur = Math.max(dur, 0.35);
    // Coeficiente de inarmonicidad tipo cuerda de piano: más fuerte en graves, casi nulo en agudos
    const B = Math.min(0.00085, 0.09 / (freq * freq) + 0.00004);

    const bodyGain = this.ctx.createGain(); bodyGain.gain.value = 1;
    // Filtro de "brillo decreciente": empieza abierto (percusión del martillo) y se cierra
    // suavemente, imitando cómo se atenúan primero los parciales agudos de una cuerda real.
    const brightness = this.ctx.createBiquadFilter();
    brightness.type = 'lowpass'; brightness.Q.value = 0.5;
    const openCut = Math.min(15000, freq * 9 + 3500);
    const closeCut = Math.max(900, freq * 1.6);
    brightness.frequency.setValueAtTime(openCut, start);
    brightness.frequency.exponentialRampToValueAtTime(closeCut, start + noteDur * 1.1 + 0.2);
    bodyGain.connect(brightness); brightness.connect(this.master);

    const stopFns = [];
    let maxTail = 0;

    harmonics.forEach(h => {
      const inharm = Math.sqrt(1 + B * h.n * h.n);
      const f0 = freq * h.n * inharm;
      const fEnd = endFreq ? endFreq * h.n * inharm : null;
      const peak = 0.85 * h.amp;
      const tailDur = noteDur * h.decay + 0.18;
      maxTail = Math.max(maxTail, tailDur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(peak, start + 0.006 + h.n * 0.0007); // el ataque llega ligerísimamente después en los armónicos altos
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.32), start + tailDur * 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, start + tailDur);
      g.connect(bodyGain);

      // Dos "cuerdas" por armónico, desafinadas unos pocos cents entre sí → batido natural
      const detunes = h.n === 1 ? [-1.3, 1.3] : [-0.6, 0.6];
      detunes.forEach(cents => {
        const osc = this.ctx.createOscillator(); osc.type = 'sine';
        const ratio = Math.pow(2, cents / 1200);
        osc.frequency.setValueAtTime(f0 * ratio, start);
        if(fEnd && endFreq !== freq){
          osc.frequency.linearRampToValueAtTime(fEnd * ratio, start + dur);
        }
        osc.connect(g);
        osc.start(start); osc.stop(start + tailDur + 0.05);
        stopFns.push((now) => { try{ osc.stop(now + 0.04); }catch{} });
      });
      stopFns.push((now) => { this._fadeStopGain(g, now, 0.03); });
    });

    // Transitorio de martillo: golpe de ruido filtrado (fieltro contra cuerda), muy breve
    const noise = this._noiseSource(false);
    const nf = this.ctx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = Math.min(7000, freq * 3.2); nf.Q.value = 0.9;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.0001, start);
    ng.gain.exponentialRampToValueAtTime(0.26, start + 0.002);
    ng.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);
    noise.connect(nf); nf.connect(ng); ng.connect(bodyGain);
    noise.start(start); noise.stop(start + 0.06);
    stopFns.push((now) => { this._fadeStopGain(ng, now, 0.02); try{ noise.stop(now + 0.03); }catch{} });

    // Resonancia de tabla armónica: cola de ruido grave, muy tenue, que da "cuerpo" a la caja
    const board = this._noiseSource(true);
    const bf = this.ctx.createBiquadFilter();
    bf.type = 'lowpass'; bf.frequency.value = Math.max(180, freq * 0.9); bf.Q.value = 0.4;
    const bg = this.ctx.createGain();
    const boardTail = maxTail * 0.9;
    bg.gain.setValueAtTime(0.0001, start);
    bg.gain.linearRampToValueAtTime(0.03, start + 0.02);
    bg.gain.exponentialRampToValueAtTime(0.0001, start + boardTail);
    board.connect(bf); bf.connect(bg); bg.connect(bodyGain);
    board.start(start); board.stop(start + boardTail + 0.1);
    stopFns.push((now) => { this._fadeStopGain(bg, now, 0.03); try{ board.stop(now + 0.04); }catch{} });

    const node = this._registerNode((now) => {
      try{
        brightness.frequency.cancelScheduledValues(now);
        brightness.frequency.setValueAtTime(brightness.frequency.value, now);
      }catch{}
      stopFns.forEach(fn => fn(now));
    }, (maxTail + 0.4) * 1000);
    return node;
  }

  /** Síntesis vocal ("ah"): fuente de sierra (rica en armónicos) filtrada por tres resonancias
   * de formante (F1/F2/F3 de la vocal "a"), envolvente ADSR suave, vibrato natural que entra
   * gradualmente y un toque de ruido de aire para dar sensación de voz real y no de sintetizador. */
  _voiceTone(freq, start, dur, endFreq){
    const source = this.ctx.createOscillator(); source.type = 'sawtooth';
    source.frequency.setValueAtTime(freq, start);
    if(endFreq && endFreq !== freq){
      source.frequency.linearRampToValueAtTime(endFreq, start + dur);
    }

    // Vibrato natural: empieza en 0 y crece hacia una profundidad pequeña (no afecta la afinación
    // percibida del objetivo, solo le da vida orgánica al sostenido).
    const vibrato = this.ctx.createOscillator(); vibrato.type = 'sine'; vibrato.frequency.value = 5.4;
    const vibratoGain = this.ctx.createGain();
    const vibDepth = Math.max(2, freq * 0.006); // ~pocos cents de profundidad
    vibratoGain.gain.setValueAtTime(0, start);
    vibratoGain.gain.linearRampToValueAtTime(vibDepth, start + Math.min(0.28, dur * 0.45));
    vibrato.connect(vibratoGain); vibratoGain.connect(source.frequency);
    vibrato.start(start); vibrato.stop(start + dur + 0.12);

    const bodyGain = this.ctx.createGain(); bodyGain.connect(this.master);
    const atk = Math.min(0.035, dur * 0.25);
    const rel = Math.min(0.07, dur * 0.32);
    const susAt = Math.max(start + atk, start + dur - rel);
    bodyGain.gain.setValueAtTime(0.0001, start);
    bodyGain.gain.linearRampToValueAtTime(0.82, start + atk);
    bodyGain.gain.setValueAtTime(0.82, susAt);
    bodyGain.gain.linearRampToValueAtTime(0.0001, start + dur);

    // Formantes de la vocal "a" (aprox. F1/F2/F3 en voz adulta), independientes de la nota
    const formants = [
      { f: 700,  q: 9,  amp: 1.00 },
      { f: 1220, q: 11, amp: 0.55 },
      { f: 2600, q: 12, amp: 0.22 },
    ];
    formants.forEach(fm => {
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = fm.f; bp.Q.value = fm.q;
      const g = this.ctx.createGain(); g.gain.value = fm.amp;
      source.connect(bp); bp.connect(g); g.connect(bodyGain);
    });

    // Aire/respiración muy sutil para que no suene 100% sintética
    const noise = this._noiseSource(true);
    const nf = this.ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 4200; nf.Q.value = 0.6;
    const ng = this.ctx.createGain(); ng.gain.value = 0.018;
    noise.connect(nf); nf.connect(ng); ng.connect(bodyGain);
    noise.start(start); noise.stop(start + dur + 0.12);

    source.start(start); source.stop(start + dur + 0.06);

    const node = this._registerNode((now) => {
      this._fadeStopGain(bodyGain, now, 0.03);
      try{ source.stop(now + 0.04); }catch{}
      try{ vibrato.stop(now + 0.04); }catch{}
      try{ noise.stop(now + 0.04); }catch{}
    });
    source.onended = () => { this._activeNodes.delete(node); };
    return node;
  }

  /**
   * Reproduce un ejercicio completo. Soporta notas escalonadas ('step') y portamento
   * continuo ('glide', p. ej. sirena / lip trill). onStep(syllable) se llama en el
   * instante de cada nota; onDone() al finalizar. speed > 1 = más rápido.
   */
  playExercise(exercise, rootMidi, speed = 1.0, { onStep, onDone } = {}){
    const gen = ++this._gen;
    this._clearTimers();
    let offset = 0;
    const pattern = exercise.pattern;
    const baseDur = (exercise.stepDur || 0.45) / speed;

    if(exercise.type === 'glide'){
      // portamento entre puntos consecutivos del patrón
      for(let i = 0; i < pattern.length - 1; i++){
        const f0 = midiToFreq(rootMidi + pattern[i]);
        const f1 = midiToFreq(rootMidi + pattern[i+1]);
        this.synthTone(f0, offset, baseDur, f1);
        const t = setTimeout(()=>{ if(gen === this._gen && onStep) onStep(exercise.syllable || intervalToSolfeggio(pattern[i])); }, Math.max(0, offset*1000));
        this._scheduledTimers.push(t);
        offset += baseDur;
      }
    } else {
      pattern.forEach((interval)=>{
        const freq = midiToFreq(rootMidi + interval);
        this.synthTone(freq, offset, baseDur);
        const t = setTimeout(()=>{ if(gen === this._gen && onStep) onStep(exercise.syllable || intervalToSolfeggio(interval)); }, Math.max(0, offset*1000));
        this._scheduledTimers.push(t);
        offset += baseDur;
      });
    }
    const doneTimer = setTimeout(()=>{ if(gen === this._gen && onDone) onDone(); }, offset*1000 + 180);
    this._scheduledTimers.push(doneTimer);
    return offset;
  }

  /**
   * Reproduce un ejemplo corto de "glissando" (sirena: la voz se desliza de grave a agudo
   * y vuelve a bajar), para que quien va a grabar sepa qué se le está pidiendo antes de
   * que empiece el contador. Devuelve una Promise que se resuelve cuando termina de sonar.
   */
  playGlissandoDemo(rootMidi = 55){
    return new Promise((resolve)=>{
      const gen = ++this._gen;
      this._clearTimers();
      const dur = 1.1;
      const low = midiToFreq(rootMidi);
      const high = midiToFreq(rootMidi + 19); // ≈ una doceava, barrido amplio y audible
      this.synthTone(low, 0, dur, high);
      this.synthTone(high, dur, dur, low);
      const t = setTimeout(()=>{ if(gen === this._gen) resolve(); }, dur*2*1000 + 150);
      this._scheduledTimers.push(t);
    });
  }

  _clearTimers(){
    this._scheduledTimers.forEach(t => clearTimeout(t));
    this._scheduledTimers = [];
  }

  /** Detiene TODO sonido, incluido el que ya está sonando (no solo lo pendiente de programar).
   * Funciona igual sin importar cuántos osciladores/filtros/ruido tenga cada nodo activo,
   * porque cada uno expone su propio stop(now). */
  stopAll(){
    this._gen++; // invalida callbacks de UI pendientes (onStep/onDone de la tanda anterior)
    this._clearTimers();
    const now = this.now();
    this._activeNodes.forEach((node) => {
      try{ node.stop(now); }catch{ /* el nodo ya pudo haber terminado */ }
    });
    this._activeNodes.clear();
  }

  /** Tono "sombra"/dron: usado por el afinador tanto en modo nota fija como en Auto Detect.
   * Se mantiene una onda limpia (con un leve segundo armónico) para que sea fácil de igualar
   * con precisión, pero ya no es un seno 100% desnudo. */
  startFollowTone(initialFreq = 220){
    if(this._followOsc) return;
    const g = this.ctx.createGain(); g.gain.value = 0.0001;
    const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = initialFreq;
    const o2 = this.ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = initialFreq * 2;
    const g2 = this.ctx.createGain(); g2.gain.value = 0.12;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.master);
    o.start(); o2.start();
    g.gain.linearRampToValueAtTime(0.25, this.now() + 0.4);
    this._followOsc = o; this._followGain = g; this._followTimbreGain = { osc2: o2, g2 };
  }
  updateFollowTone(freq){
    if(!this._followOsc || !freq) return;
    const t = this.now() + 0.08;
    this._followOsc.frequency.linearRampToValueAtTime(freq, t);
    if(this._followTimbreGain) this._followTimbreGain.osc2.frequency.linearRampToValueAtTime(freq * 2, t);
  }
  stopFollowTone(){
    if(!this._followOsc) return;
    const now = this.now();
    try{
      this._followGain.gain.cancelScheduledValues(now);
      this._followGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      this._followOsc.stop(now + 0.2);
      if(this._followTimbreGain) this._followTimbreGain.osc2.stop(now + 0.2);
    }catch{}
    this._followOsc = null; this._followGain = null; this._followTimbreGain = null;
  }
}
