// analysis.js — analiza audio ya grabado: curva de pitch, comparación con un ejercicio
// (puntaje de afinación nota por nota) y análisis de vibrato sobre una nota sostenida.

import { yinDetect, freqToNote, rms, midiToFreq, freqToMidiExact } from './pitch.js';
import { intervalToSolfeggio } from './exercises.js';

/**
 * Recorre un AudioBuffer en ventanas y devuelve la curva de pitch: [{t, freq, level}]
 * t en segundos, freq en Hz (0 si no se detectó tono claro).
 */
export function buildPitchTrack(audioBuffer, { frameSize = 2048, hop = 1024, threshold = 0.12 } = {}){
  const ch = audioBuffer.getChannelData(0);
  const sr = audioBuffer.sampleRate;
  const track = [];
  for(let i = 0; i + frameSize <= ch.length; i += hop){
    const frame = ch.subarray(i, i + frameSize);
    const level = rms(frame);
    let freq = 0;
    if(level >= 0.012){
      const f = yinDetect(frame, sr, threshold);
      if(f > 0) freq = f;
    }
    track.push({ t: i / sr, freq, level });
  }
  return track;
}

/**
 * Compara una curva de pitch contra la secuencia esperada de un ejercicio (mismo root/speed
 * usados al reproducirlo) y produce un desglose nota por nota + puntaje global.
 */
export function scoreAgainstExercise(track, exercise, rootMidi, speed = 1.0, { a4 = 440, tolerance = 15 } = {}){
  const baseDur = (exercise.stepDur || 0.45) / speed;
  const notes = exercise.pattern.map((interval, idx)=>{
    const targetMidi = rootMidi + interval;
    const targetFreq = midiToFreq(targetMidi, a4);
    const start = idx * baseDur, end = start + baseDur;
    const frames = track.filter(p => p.t >= start && p.t < end && p.freq > 0);
    let avgCents = null, status = 'sin_datos';
    if(frames.length){
      const centsList = frames.map(p => (freqToMidiExact(p.freq, a4) - targetMidi) * 100);
      avgCents = centsList.reduce((a,b)=>a+b,0) / centsList.length;
      const abs = Math.abs(avgCents);
      status = abs <= tolerance ? 'afinado' : (abs <= tolerance*2.2 ? 'cerca' : 'desafinado');
    }
    return {
      index: idx, start, end, targetFreq, targetMidi,
      label: exercise.syllable || intervalToSolfeggio(interval),
      avgCents, status
    };
  });
  const scored = notes.filter(n=> n.status !== 'sin_datos');
  const afinadas = notes.filter(n=> n.status === 'afinado').length;
  const score = scored.length ? Math.round((afinadas / notes.length) * 100) : 0;
  return { notes, score, totalDuration: exercise.pattern.length * baseDur };
}

/** Análisis de intonación libre (sin ejercicio): compara cada frame contra la nota cromática más cercana. */
export function freeIntonationCurve(track, { a4 = 440, notation = 'solfege' } = {}){
  return track.map(p=>{
    if(!p.freq) return { ...p, cents:null, note:null };
    const note = freqToNote(p.freq, { a4, notation });
    return { ...p, cents: note ? note.cents : null, note };
  });
}

/**
 * Analiza vibrato sobre una curva de pitch de una nota sostenida.
 * Estima frecuencia media, extrae la oscilación de cents respecto a esa media,
 * cuenta cruces por cero para estimar la tasa (Hz), calcula la amplitud (extensión en cents)
 * y una consistencia simple a partir de la variación de los semiperiodos.
 */
export function analyzeVibrato(track, { a4 = 440, trimStart = 0.3, trimEnd = 0.2 } = {}){
  const voiced = track.filter(p=> p.freq > 0);
  if(voiced.length < 8) return null;
  const t0 = voiced[0].t, t1 = voiced[voiced.length-1].t;
  const usable = voiced.filter(p=> p.t >= t0 + trimStart && p.t <= t1 - trimEnd);
  if(usable.length < 8) return null;

  const midis = usable.map(p=> freqToMidiExact(p.freq, a4));
  const meanMidi = midis.reduce((a,b)=>a+b,0) / midis.length;
  const centsCurve = usable.map((p,i)=> ({ t:p.t, cents:(midis[i]-meanMidi)*100 }));

  // cruces por cero -> semiperiodos
  const crossings = [];
  for(let i=1;i<centsCurve.length;i++){
    const a = centsCurve[i-1].cents, b = centsCurve[i].cents;
    if((a <= 0 && b > 0) || (a >= 0 && b < 0)){
      const ta = centsCurve[i-1].t, tb = centsCurve[i].t;
      const frac = a === b ? 0 : (0 - a) / (b - a);
      crossings.push(ta + frac*(tb-ta));
    }
  }
  const halfPeriods = [];
  for(let i=1;i<crossings.length;i++) halfPeriods.push(crossings[i]-crossings[i-1]);

  let rateHz = 0, consistency = 0;
  if(halfPeriods.length >= 2){
    const meanHalf = halfPeriods.reduce((a,b)=>a+b,0) / halfPeriods.length;
    rateHz = meanHalf > 0 ? 1 / (meanHalf*2) : 0;
    const variance = halfPeriods.reduce((s,v)=> s + Math.pow(v-meanHalf,2), 0) / halfPeriods.length;
    const stdev = Math.sqrt(variance);
    consistency = meanHalf > 0 ? Math.max(0, Math.min(1, 1 - (stdev/meanHalf))) : 0;
  }
  const maxC = Math.max(...centsCurve.map(c=>c.cents));
  const minC = Math.min(...centsCurve.map(c=>c.cents));
  const extentCents = (maxC - minC) / 2;

  return { rateHz, extentCents, consistency, curve: centsCurve, meanFreq: midiToFreq(meanMidi, a4) };
}
