// app.js — orquesta toda la interfaz de Vocalizer 2026.
import { EXERCISES, CATEGORIES, PROGRESSIONS, findExercise, exerciseDuration } from './exercises.js';
import { yinDetect, freqToNote, rms, freqToMidiExact, midiToFreq, SOLFEGE_NAMES, LETTER_NAMES } from './pitch.js';
import { AudioEngine } from './audio.js';
import { MicManager } from './mic.js';
import {
  saveRecording, listRecordings, deleteRecording, clearRecordings,
  loadSettings, saveSettings, saveVibratoResult, listVibratoHistory
} from './storage.js';
import { blobToWav } from './wav-encoder.js';
import { buildPitchTrack, scoreAgainstExercise, freeIntonationCurve, analyzeVibrato } from './analysis.js';

/* ================= Settings ================= */
const DEFAULT_SETTINGS = {
  theme:'dark', notation:'solfege', a4:440, tolerance:15, yinThreshold:10, latencyMs:0, reduceMotion:false,
  range:'soprano', customRoot:60, bpm:90, speed:100, timbre:'voz', loop:false,
  transpose:0, autoTranspose:false, autoTransposeDir:'up',
  favorites:[], routines:[], onboarded:false, skipOnboarding:false,
  micDeviceId:'', micGain:1
};
const settings = loadSettings(DEFAULT_SETTINGS);
if(!Array.isArray(settings.favorites)) settings.favorites = [];
if(!Array.isArray(settings.routines)) settings.routines = [];

const $ = id => document.getElementById(id);

/* ================= Toasts ================= */
const toastRegion = $('toastRegion');
function showToast(msg, type=''){
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  toastRegion.appendChild(el);
  setTimeout(()=> el.remove(), 3600);
}

/* ================= Theme & motion ================= */
const themeToggle = $('themeToggle');
function applyTheme(theme){
  document.body.classList.toggle('light', theme === 'light');
  themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  themeToggle.setAttribute('aria-label', theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
}
applyTheme(settings.theme);
themeToggle.addEventListener('click', ()=>{
  settings.theme = settings.theme === 'light' ? 'dark' : 'light';
  applyTheme(settings.theme); saveSettings(settings);
});

const reduceMotionCheck = $('reduceMotion');
function applyReduceMotion(v){ document.body.classList.toggle('reduce-motion', !!v); }
applyReduceMotion(settings.reduceMotion);
reduceMotionCheck.checked = settings.reduceMotion;
reduceMotionCheck.addEventListener('change', ()=>{ settings.reduceMotion = reduceMotionCheck.checked; applyReduceMotion(settings.reduceMotion); saveSettings(settings); });

/* ================= Tabs ================= */
const tabs = [...document.querySelectorAll('.tab')];
tabs.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    tabs.forEach(t=>{ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected','true');
    document.querySelectorAll('.tabpanel').forEach(p=> p.hidden = true);
    $(tab.getAttribute('aria-controls')).hidden = false;
    if(tab.id === 'tab-grabaciones') renderRecordings();
    if(tab.id === 'tab-vibrato') renderVibratoHistory();
    if(tab.id === 'tab-rutinas') renderSavedRoutines();
  });
});

/* ================= Audio engine + mic (una sola fuente compartida) ================= */
const engine = new AudioEngine();
engine.timbre = settings.timbre;
if(settings.timbre === 'piano') engine.preloadPiano();
const mic = new MicManager(engine.ctx);
mic.setSensitivity(settings.micGain || 1);
let micReady = false, micPending = null;
async function ensureMic(){
  if(micReady) return;
  if(!micPending) micPending = mic.ensure(settings.micDeviceId || undefined).then(()=>{ micReady = true; mic.setSensitivity(settings.micGain || 1); }).finally(()=>{ micPending = null; });
  return micPending;
}

/** Muestra "3", "2", "1" (con un click sonoro en cada número) antes de una acción.
 *  onTick(n) se llama para actualizar la interfaz en cada número. Devuelve una Promise
 *  que se resuelve justo cuando debe empezar la grabación/acción. */
function runCountdown(onTick, seconds = 3, intervalMs = 900){
  return new Promise((resolve)=>{
    let n = seconds;
    const step = ()=>{
      try{ onTick(n); }catch{}
      try{ engine.clickTone(); }catch{}
      n--;
      if(n <= 0){ setTimeout(resolve, intervalMs); return; }
      setTimeout(step, intervalMs);
    };
    step();
  });
}

function getRootMidi(){
  const map = { soprano:64, mezzo:60, alto:57, tenor:52, baritone:48, bass:45 };
  const base = rangeSelect.value === 'custom' ? (Number(customRoot.value) || 60) : (map[rangeSelect.value] ?? 60);
  return base + (settings.transpose || 0);
}
function noteNameForMidi(midi){
  const names = settings.notation === 'letters' ? LETTER_NAMES : SOLFEGE_NAMES;
  const name = names[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}
function getSpeed(){ return (Number(speedSlider.value) || 100) / 100; }
function fmtNote(freq){
  const n = freqToNote(freq, { a4: settings.a4, notation: settings.notation });
  return n ? `${n.name}${n.octave} (${freq.toFixed(1)} Hz)` : `${freq.toFixed(1)} Hz`;
}

/* ================= Ripple + click feedback ================= */
function createRipple(ev){
  const btn = ev.currentTarget;
  const rect = btn.getBoundingClientRect();
  const r = document.createElement('span'); r.className = 'ripple';
  const size = Math.max(rect.width, rect.height) * 0.9;
  r.style.width = r.style.height = size + 'px';
  const x = (ev.clientX ?? rect.left + rect.width/2) - rect.left - size/2;
  const y = (ev.clientY ?? rect.top + rect.height/2) - rect.top - size/2;
  r.style.left = x + 'px'; r.style.top = y + 'px';
  btn.appendChild(r); setTimeout(()=> r.remove(), 650);
  try{ engine.clickTone(); }catch{}
}
document.addEventListener('click', (ev)=>{
  const btn = ev.target.closest('.btn, .iconBtn, .chip, .segBtn');
  if(btn) createRipple({ currentTarget:btn, clientX:ev.clientX, clientY:ev.clientY });
});

/* ================= Voice range classification ================= */
const VOICE_RANGES = [
  { id:'bass', label:'Bajo', lo:82, hi:330 },
  { id:'baritone', label:'Barítono', lo:98, hi:392 },
  { id:'tenor', label:'Tenor', lo:131, hi:523 },
  { id:'alto', label:'Contralto', lo:175, hi:698 },
  { id:'mezzo', label:'Mezzosoprano', lo:220, hi:880 },
  { id:'soprano', label:'Soprano', lo:262, hi:1047 }
];
function classifyVoiceRange(minF, maxF){
  let best = null, bestScore = Infinity;
  for(const r of VOICE_RANGES){
    const score = Math.abs(Math.log2(minF / r.lo)) + Math.abs(Math.log2(maxF / r.hi));
    if(score < bestScore){ bestScore = score; best = r; }
  }
  return best;
}

/** Graba `durationMs` desde el micrófono compartido y devuelve el rango [minF,maxF] detectado. */
function recordRangeSample(progressBarEl, durationMs){
  return new Promise((resolve)=>{
    const chunks = [];
    const recorder = new MediaRecorder(mic.getRecordingStream());
    recorder.ondataavailable = e=>{ if(e.data && e.data.size) chunks.push(e.data); };
    const startedAt = performance.now();
    const tick = ()=>{
      const pct = Math.min(100, ((performance.now() - startedAt) / durationMs) * 100);
      if(progressBarEl) progressBarEl.style.width = pct + '%';
      if(pct < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    recorder.onstop = async ()=>{
      try{
        const blob = new Blob(chunks, { type:'audio/webm' });
        const ab = await blob.arrayBuffer();
        const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await decodeCtx.decodeAudioData(ab.slice(0));
        const track = buildPitchTrack(audioBuffer);
        decodeCtx.close();
        let minF = Infinity, maxF = 0;
        track.forEach(p=>{ if(p.freq > 0){ if(p.freq < minF) minF = p.freq; if(p.freq > maxF) maxF = p.freq; } });
        resolve({ minF, maxF });
      }catch{ resolve({ minF:Infinity, maxF:0 }); }
    };
    recorder.start();
    setTimeout(()=> recorder.stop(), durationMs);
  });
}

/* ================= Practicar: controles ================= */
const rangeSelect = $('rangeSelect'), customRangeLabel = $('customRangeLabel'), customRoot = $('customRoot');
const bpmSlider = $('bpm'), bpmVal = $('bpmVal');
const speedSlider = $('speedSlider'), speedVal = $('speedVal');
const timbreSelect = $('timbreSelect');
const playBtn = $('playBtn'), stopBtn = $('stopBtn'), loopBtn = $('loopBtn');
const metronomeBtn = $('metronomeBtn'), findRangeBtn = $('findRangeBtn');
const recordBtn = $('recordBtn');

rangeSelect.value = settings.range;
customRangeLabel.hidden = settings.range !== 'custom';
customRoot.value = settings.customRoot;
bpmSlider.value = settings.bpm; bpmVal.innerHTML = `${settings.bpm} <small>BPM</small>`;
speedSlider.value = settings.speed; speedVal.textContent = (settings.speed/100).toFixed(2) + '×';
timbreSelect.value = settings.timbre;

rangeSelect.addEventListener('change', ()=>{
  customRangeLabel.hidden = rangeSelect.value !== 'custom';
  settings.range = rangeSelect.value; saveSettings(settings);
  updateTransposeDisplay();
});
customRoot.addEventListener('change', ()=>{ settings.customRoot = Number(customRoot.value); saveSettings(settings); updateTransposeDisplay(); });
bpmSlider.addEventListener('input', ()=>{
  bpmVal.innerHTML = `${bpmSlider.value} <small>BPM</small>`;
  settings.bpm = Number(bpmSlider.value); saveSettings(settings);
  if(engine.metronomeOn) engine.startMetronome(settings.bpm);
});
speedSlider.addEventListener('input', ()=>{
  speedVal.textContent = (Number(speedSlider.value)/100).toFixed(2) + '×';
  settings.speed = Number(speedSlider.value); saveSettings(settings);
});
timbreSelect.addEventListener('change', ()=>{ engine.timbre = timbreSelect.value; settings.timbre = timbreSelect.value; saveSettings(settings); if(timbreSelect.value === 'piano') engine.preloadPiano(); });

/* ----- Transponer: subir/bajar de tono por semitono, en cualquier tecla del piano ----- */
const transposeUpBtn = $('transposeUpBtn'), transposeDownBtn = $('transposeDownBtn'), transposeResetBtn = $('transposeResetBtn');
const transposeDisplay = $('transposeDisplay');
const autoTransposeCheck = $('autoTranspose'), autoTransposeDirSelect = $('autoTransposeDir');
const TRANSPOSE_MIN = -12, TRANSPOSE_MAX = 12;

function updateTransposeDisplay(){ transposeDisplay.textContent = noteNameForMidi(getRootMidi()); }

transposeUpBtn.addEventListener('click', ()=>{
  settings.transpose = Math.min(TRANSPOSE_MAX, (settings.transpose||0) + 1);
  saveSettings(settings); updateTransposeDisplay();
});
transposeDownBtn.addEventListener('click', ()=>{
  settings.transpose = Math.max(TRANSPOSE_MIN, (settings.transpose||0) - 1);
  saveSettings(settings); updateTransposeDisplay();
});
transposeResetBtn.addEventListener('click', ()=>{
  settings.transpose = 0; saveSettings(settings); updateTransposeDisplay();
});
autoTransposeCheck.checked = settings.autoTranspose;
autoTransposeDirSelect.value = settings.autoTransposeDir;
autoTransposeCheck.addEventListener('change', ()=>{ settings.autoTranspose = autoTransposeCheck.checked; saveSettings(settings); });
autoTransposeDirSelect.addEventListener('change', ()=>{ settings.autoTransposeDir = autoTransposeDirSelect.value; saveSettings(settings); });
updateTransposeDisplay();

/* ================= Biblioteca de ejercicios (búsqueda, categorías, favoritos) ================= */
let activeCategory = 'all';
let currentExerciseId = EXERCISES[0].id;
const exerciseSearch = $('exerciseSearch');

function renderCategoryChips(){
  const wrap = $('categoryChips'); wrap.innerHTML = '';
  const all = [{ id:'all', nombre:'Todas' }, { id:'favoritos', nombre:'★ Favoritos' }, ...CATEGORIES];
  all.forEach(c=>{
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip' + (activeCategory === c.id ? ' active' : ''); b.textContent = c.nombre;
    b.addEventListener('click', ()=>{ activeCategory = c.id; renderCategoryChips(); renderExerciseList(); });
    wrap.appendChild(b);
  });
}
function toggleFavorite(id){
  const i = settings.favorites.indexOf(id);
  if(i === -1) settings.favorites.push(id); else settings.favorites.splice(i,1);
  saveSettings(settings); renderExerciseList();
}
function renderExerciseList(){
  const q = exerciseSearch.value.trim().toLowerCase();
  const list = $('exerciseList'); list.innerHTML = '';
  const filtered = EXERCISES.filter(ex=>{
    if(activeCategory === 'favoritos' && !settings.favorites.includes(ex.id)) return false;
    if(activeCategory !== 'all' && activeCategory !== 'favoritos' && ex.categoria !== activeCategory) return false;
    if(q && !ex.nombre.toLowerCase().includes(q) && !ex.descripcion.toLowerCase().includes(q)) return false;
    return true;
  });
  if(filtered.length === 0){
    const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Sin resultados.'; list.appendChild(li); return;
  }
  filtered.forEach(ex=>{
    const li = document.createElement('li');
    li.className = 'exerciseItem' + (ex.id === currentExerciseId ? ' selected' : '');
    li.title = ex.descripcion;
    const fav = document.createElement('button');
    fav.type = 'button'; fav.className = 'favBtn' + (settings.favorites.includes(ex.id) ? ' active' : ''); fav.textContent = '★';
    fav.setAttribute('aria-label', 'Marcar como favorito');
    fav.addEventListener('click', (ev)=>{ ev.stopPropagation(); toggleFavorite(ex.id); });
    const nameWrap = document.createElement('div'); nameWrap.className = 'exName';
    const catName = (CATEGORIES.find(c=> c.id === ex.categoria) || {}).nombre || ex.categoria;
    nameWrap.innerHTML = `<strong>${escapeHtml(ex.nombre)}</strong><small>${escapeHtml(catName)} · ${escapeHtml(ex.nivel)}</small>`;
    li.append(fav, nameWrap);
    li.addEventListener('click', ()=>{ currentExerciseId = ex.id; renderExerciseList(); });
    list.appendChild(li);
  });
}
exerciseSearch.addEventListener('input', renderExerciseList);

function renderProgressions(){
  const list = $('progressionList'); list.innerHTML = '';
  PROGRESSIONS.forEach(p=>{
    const li = document.createElement('li');
    const span = document.createElement('span'); span.textContent = p.nombre;
    const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = '▶';
    btn.addEventListener('click', ()=> startPlayback(p.steps.slice(), { loop:loopEnabled }));
    li.append(span, btn); list.appendChild(li);
  });
}

function populatePlainExerciseSelect(selectEl){
  selectEl.innerHTML = '';
  CATEGORIES.forEach(cat=>{
    const group = document.createElement('optgroup'); group.label = cat.nombre;
    EXERCISES.filter(ex=> ex.categoria === cat.id).forEach(ex=>{
      const o = document.createElement('option'); o.value = ex.id; o.textContent = ex.nombre;
      group.appendChild(o);
    });
    selectEl.appendChild(group);
  });
}

/* ================= Solfège display ================= */
const solfegeEl = $('solfege');
function showSolfege(text){
  solfegeEl.textContent = text;
  solfegeEl.classList.remove('pop'); void solfegeEl.offsetWidth; solfegeEl.classList.add('pop');
}
function clearSolfege(){ solfegeEl.textContent = '—'; solfegeEl.classList.remove('pop'); }

/* ================= Reproducción (única / progresión / rutina) con Bucle real ================= */
let loopEnabled = false, playing = false, sequenceLoop = false, baseQueue = [];
loopBtn.addEventListener('click', ()=>{
  loopEnabled = !loopEnabled;
  loopBtn.textContent = `⟲ Bucle: ${loopEnabled ? 'On' : 'Off'}`;
  loopBtn.setAttribute('aria-pressed', String(loopEnabled));
});

function playQueueRun(queue){
  if(!playing) return;
  if(queue.length === 0){
    if(sequenceLoop){
      if(settings.autoTranspose){
        const dir = settings.autoTransposeDir === 'down' ? -1 : 1;
        const next = (settings.transpose||0) + dir;
        if(next > TRANSPOSE_MAX || next < TRANSPOSE_MIN){
          showToast('Llegaste al límite de transposición para este ejercicio.');
          stopPlayback();
          return;
        }
        settings.transpose = next; saveSettings(settings); updateTransposeDisplay();
      }
      playQueueRun(baseQueue.slice());
    } else { playing = false; clearSolfege(); playBtn.setAttribute('aria-pressed','false'); }
    return;
  }
  const id = queue.shift();
  const ex = findExercise(id);
  if(!ex){ playQueueRun(queue); return; }
  currentExerciseId = id; renderExerciseList();
  engine.playExercise(ex, getRootMidi(), getSpeed(), { onStep: showSolfege, onDone: ()=> playQueueRun(queue) });
}
function startPlayback(ids, { loop=false } = {}){
  engine.stopAll();
  playing = true; sequenceLoop = loop; baseQueue = ids.slice();
  playQueueRun(ids.slice());
  playBtn.setAttribute('aria-pressed','true');
}
function stopPlayback(){
  playing = false; sequenceLoop = false;
  engine.stopAll();
  clearSolfege();
  playBtn.setAttribute('aria-pressed','false');
}

playBtn.addEventListener('click', async ()=>{
  await engine.resume();
  try{ await ensureMic(); if(!vizRaf) drawViz(); }catch{ showToast('No se pudo activar el micrófono: revisa los permisos.', 'error'); }
  startPlayback([currentExerciseId], { loop: loopEnabled });
});
stopBtn.addEventListener('click', stopPlayback);

/* ================= Metrónomo ================= */
metronomeBtn.addEventListener('click', async ()=>{
  await engine.resume();
  if(engine.metronomeOn){ engine.stopMetronome(); metronomeBtn.setAttribute('aria-pressed','false'); }
  else { engine.startMetronome(Number(bpmSlider.value)); metronomeBtn.setAttribute('aria-pressed','true'); }
});

/* ================= Afinador en vivo (compartido: gauge de Practicar + gauge del Afinador) ================= */
const needle = $('needle'), gaugeActive = $('gaugeActive');
const detectedNoteEl = $('detectedNote'), detectedFreqEl = $('detectedFreq'), detectedCentsEl = $('detectedCents');
const needle2 = $('needle2'), gaugeActive2 = $('gaugeActive2');
const detectedNoteEl2 = $('detectedNote2'), detectedFreqEl2 = $('detectedFreq2'), detectedCentsEl2 = $('detectedCents2');
const viz = $('viz'); const vizCtx = viz.getContext('2d');

function setGauge(needleEl, gaugeActiveEl, cents, hasPitch){
  const clamped = Math.max(-50, Math.min(50, cents || 0));
  const deg = hasPitch ? (clamped / 50) * 80 : 0;
  needleEl.style.transform = `rotate(${deg}deg)`;
  const inTune = hasPitch && Math.abs(clamped) <= (settings.tolerance || 15);
  needleEl.setAttribute('stroke', inTune ? 'var(--success)' : 'var(--accent-coral)');
  gaugeActiveEl.setAttribute('stroke', inTune ? 'var(--success)' : 'var(--accent-gold)');
}

function resizeVizCanvas(){
  const dpr = window.devicePixelRatio || 1;
  viz.width = viz.clientWidth * dpr; viz.height = viz.clientHeight * dpr;
  vizCtx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resizeVizCanvas);
resizeVizCanvas();

/* ----- Afinador dedicado: estado ----- */
let tunerMode = 'select'; // 'select' | 'auto'
let tunerTargetMidi = null;
let tunerFollowActive = false, tunerPlayActive = false;
const tunerNoteSelect = $('tunerNoteSelect'), tunerOctave = $('tunerOctave');
const tunerModeSelectBtn = $('tunerModeSelectBtn'), tunerModeAutoBtn = $('tunerModeAutoBtn');
const tunerNoteControls = $('tunerNoteControls'), tunerAutoControls = $('tunerAutoControls');
const tunerPlayNoteBtn = $('tunerPlayNoteBtn'), tunerFollowBtn = $('tunerFollowBtn');
const statAttack = $('statAttack'), statSustain = $('statSustain'), statIntonation = $('statIntonation');

function populateTunerNoteSelect(){
  const names = settings.notation === 'letters' ? LETTER_NAMES : SOLFEGE_NAMES;
  tunerNoteSelect.innerHTML = '';
  names.forEach((n, i)=>{
    const o = document.createElement('option'); o.value = i; o.textContent = n;
    tunerNoteSelect.appendChild(o);
  });
}
populateTunerNoteSelect();

function currentTunerNoteFreq(){
  const midi = (Number(tunerOctave.value) + 1) * 12 + Number(tunerNoteSelect.value);
  return { midi, freq: midiToFreq(midi, settings.a4) };
}

function setTunerMode(mode){
  tunerMode = mode;
  tunerModeSelectBtn.classList.toggle('active', mode === 'select');
  tunerModeSelectBtn.setAttribute('aria-checked', String(mode === 'select'));
  tunerModeAutoBtn.classList.toggle('active', mode === 'auto');
  tunerModeAutoBtn.setAttribute('aria-checked', String(mode === 'auto'));
  tunerNoteControls.hidden = mode !== 'select';
  tunerAutoControls.hidden = mode !== 'auto';
  engine.stopFollowTone();
  tunerFollowActive = false; tunerPlayActive = false;
  tunerPlayNoteBtn.setAttribute('aria-pressed','false');
  tunerFollowBtn.setAttribute('aria-pressed','false');
  tunerTargetMidi = mode === 'select' ? currentTunerNoteFreq().midi : null;
}
tunerModeSelectBtn.addEventListener('click', ()=> setTunerMode('select'));
tunerModeAutoBtn.addEventListener('click', ()=> setTunerMode('auto'));
setTunerMode('select');

tunerNoteSelect.addEventListener('change', ()=>{ tunerTargetMidi = currentTunerNoteFreq().midi; if(tunerPlayActive) engine.updateFollowTone(currentTunerNoteFreq().freq); });
tunerOctave.addEventListener('change', ()=>{ tunerTargetMidi = currentTunerNoteFreq().midi; if(tunerPlayActive) engine.updateFollowTone(currentTunerNoteFreq().freq); });

tunerPlayNoteBtn.addEventListener('click', async ()=>{
  await engine.resume();
  tunerPlayActive = !tunerPlayActive;
  tunerPlayNoteBtn.setAttribute('aria-pressed', String(tunerPlayActive));
  if(tunerPlayActive) engine.startFollowTone(currentTunerNoteFreq().freq);
  else engine.stopFollowTone();
});
tunerFollowBtn.addEventListener('click', async ()=>{
  await engine.resume();
  try{ await ensureMic(); if(!vizRaf) drawViz(); }catch{ showToast('No se pudo activar el micrófono.', 'error'); return; }
  tunerFollowActive = !tunerFollowActive;
  tunerFollowBtn.setAttribute('aria-pressed', String(tunerFollowActive));
  if(tunerFollowActive) engine.startFollowTone(220); else engine.stopFollowTone();
});

/* ----- Estadísticas de ataque / sostenido / intonación ----- */
let voiceOn = false, onsetAt = 0, attackLockedAt = null, sustainCentsSamples = [];
function resetVoiceStats(){ voiceOn = false; attackLockedAt = null; sustainCentsSamples = []; }
function updateTunerStats(hasPitch, cents){
  const now = performance.now();
  if(hasPitch){
    if(!voiceOn){ voiceOn = true; onsetAt = now; attackLockedAt = null; sustainCentsSamples = []; }
    if(attackLockedAt === null && Math.abs(cents) <= (settings.tolerance*1.5)){
      attackLockedAt = now;
      statAttack.textContent = Math.round(now - onsetAt) + ' ms';
    }
    if(attackLockedAt !== null){
      sustainCentsSamples.push(cents);
      statSustain.textContent = ((now - attackLockedAt)/1000).toFixed(1) + ' s';
      const avgAbs = sustainCentsSamples.reduce((a,b)=> a+Math.abs(b),0) / sustainCentsSamples.length;
      statIntonation.textContent = Math.round(avgAbs) + ' cents';
    }
  } else if(voiceOn){
    resetVoiceStats();
  }
}

/* ----- Bucle principal de detección + dibujo ----- */
let vizRaf = null, vizFrameCounter = 0;
function drawViz(){
  const w = viz.clientWidth, h = viz.clientHeight;
  vizCtx.clearRect(0,0,w,h);
  const data = new Float32Array(mic.analyser.fftSize);
  mic.getFloatTimeDomainData(data);

  vizCtx.beginPath();
  const slice = w / data.length; let x = 0;
  for(let i=0;i<data.length;i++){ const v = data[i]*0.5+0.5; const y = v*h; i===0 ? vizCtx.moveTo(x,y) : vizCtx.lineTo(x,y); x += slice; }
  vizCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-rose') || '#e88ac0';
  vizCtx.lineWidth = 1.6; vizCtx.stroke();

  vizFrameCounter++;
  if(vizFrameCounter % 6 === 0){
    const level = rms(data);
    let hasPitch = false, cents = 0, freq = 0, note = null;
    if(level >= 0.012){
      const threshold = (settings.yinThreshold || 10) / 100;
      const f = yinDetect(data.slice(0, 2048), engine.ctx.sampleRate, threshold);
      if(f > 0){
        freq = f; hasPitch = true;
        note = freqToNote(f, { a4: settings.a4, notation: settings.notation });
        cents = note ? note.cents : 0;
      }
    }
    // gauge Practicar: siempre respecto a la nota cromática más cercana
    if(hasPitch){
      detectedNoteEl.textContent = note ? `${note.name}${note.octave}` : '--';
      detectedFreqEl.textContent = freq.toFixed(1);
      detectedCentsEl.textContent = cents;
    } else {
      detectedNoteEl.textContent = '--'; detectedFreqEl.textContent = '--'; detectedCentsEl.textContent = '--';
    }
    setGauge(needle, gaugeActive, cents, hasPitch);

    // gauge Afinador: respecto al objetivo fijo si existe (modo "Seleccionar nota")
    let tunerCents = cents;
    if(hasPitch && tunerMode === 'select' && tunerTargetMidi !== null){
      tunerCents = (freqToMidiExact(freq, settings.a4) - tunerTargetMidi) * 100;
    }
    if(hasPitch){
      detectedNoteEl2.textContent = note ? `${note.name}${note.octave}` : '--';
      detectedFreqEl2.textContent = freq.toFixed(1);
      detectedCentsEl2.textContent = Math.round(tunerCents);
    } else {
      detectedNoteEl2.textContent = '--'; detectedFreqEl2.textContent = '--'; detectedCentsEl2.textContent = '--';
    }
    setGauge(needle2, gaugeActive2, tunerCents, hasPitch);
    updateTunerStats(hasPitch, tunerCents);

    if(tunerMode === 'auto' && tunerFollowActive && hasPitch) engine.updateFollowTone(freq);
  }
  vizRaf = requestAnimationFrame(drawViz);
}

document.addEventListener('click', async ()=>{
  await engine.resume();
  try{ await ensureMic(); resizeVizCanvas(); if(!vizRaf) drawViz(); }catch{ /* se reintenta en próximos clics */ }
}, { once:true });

/* ================= Grabación (Practicar) ================= */
let mediaRecorder = null, recordedChunks = [];
recordBtn.addEventListener('click', async ()=>{
  if(recordBtn.dataset.recording === 'true'){ mediaRecorder.stop(); return; }
  try{ await ensureMic(); }catch{ showToast('No se pudo acceder al micrófono.', 'error'); return; }
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(mic.getRecordingStream());
  mediaRecorder.ondataavailable = e=>{ if(e.data && e.data.size) recordedChunks.push(e.data); };
  const startedAt = Date.now();
  mediaRecorder.onstop = async ()=>{
    recordBtn.dataset.recording = 'false'; recordBtn.textContent = '⏺ Grabar'; recordBtn.setAttribute('aria-pressed','false');
    const blob = new Blob(recordedChunks, { type:'audio/webm' });
    const ex = findExercise(currentExerciseId);
    await saveRecording({ blob, mimeType:'audio/webm', durationSec:(Date.now()-startedAt)/1000, exerciseName: ex ? ex.nombre : null });
    showToast('Grabación guardada.');
    if(!$('panel-grabaciones').hidden) renderRecordings();
  };
  mediaRecorder.start();
  recordBtn.dataset.recording = 'true'; recordBtn.textContent = '■ Detener grabación'; recordBtn.setAttribute('aria-pressed','true');
});

/* ================= Biblioteca de grabaciones ================= */
const recordingsList = $('recordingsList'), emptyRecordings = $('emptyRecordings'), clearRecordingsBtn = $('clearRecordingsBtn');
function fmtDate(ts){ return new Date(ts).toLocaleString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
async function renderRecordings(){
  const items = await listRecordings();
  recordingsList.innerHTML = '';
  emptyRecordings.hidden = items.length > 0;
  items.forEach(rec=>{
    const li = document.createElement('li');
    const url = URL.createObjectURL(rec.blob);
    const audio = document.createElement('audio'); audio.controls = true; audio.src = url;
    const meta = document.createElement('div'); meta.className = 'recMeta';
    meta.innerHTML = `${rec.exerciseName ? escapeHtml(rec.exerciseName) + ' · ' : ''}${fmtDate(rec.createdAt)}`;
    const dlWebm = document.createElement('button'); dlWebm.className = 'btn'; dlWebm.textContent = 'Descargar';
    dlWebm.addEventListener('click', ()=>{ const a = document.createElement('a'); a.href = url; a.download = `vocalizer_${rec.id}.webm`; a.click(); });
    const dlWav = document.createElement('button'); dlWav.className = 'btn'; dlWav.textContent = 'Como WAV';
    dlWav.addEventListener('click', async ()=>{
      dlWav.disabled = true; dlWav.textContent = 'Convirtiendo…';
      try{
        const wavBlob = await blobToWav(rec.blob);
        const wavUrl = URL.createObjectURL(wavBlob);
        const a = document.createElement('a'); a.href = wavUrl; a.download = `vocalizer_${rec.id}.wav`; a.click();
        URL.revokeObjectURL(wavUrl);
      }catch{ showToast('No se pudo convertir a WAV en este navegador.', 'error'); }
      dlWav.disabled = false; dlWav.textContent = 'Como WAV';
    });
    const del = document.createElement('button'); del.className = 'btn danger'; del.textContent = 'Eliminar';
    del.addEventListener('click', async ()=>{ await deleteRecording(rec.id); renderRecordings(); });
    li.append(audio, meta, dlWebm, dlWav, del);
    recordingsList.appendChild(li);
  });
}
clearRecordingsBtn.addEventListener('click', async ()=>{
  if(!confirm('¿Borrar todas las grabaciones guardadas en este dispositivo?')) return;
  await clearRecordings(); renderRecordings(); showToast('Grabaciones eliminadas.');
});

/* ================= Encontrar mi rango (diálogo) ================= */
const findRangeDialog = $('rangeDialog'), rangeDialogText = $('rangeDialogText'), rangeProgressBar = $('rangeProgressBar'), rangeResult = $('rangeResult'), rangeStartBtn = $('rangeStartBtn');
findRangeBtn.addEventListener('click', ()=>{
  rangeResult.hidden = true; rangeProgressBar.style.width = '0%'; rangeStartBtn.hidden = false; rangeStartBtn.disabled = false;
  rangeDialogText.textContent = 'Primero escucharás un ejemplo de glissando (deslizar la voz de grave a agudo y de vuelta) y luego un contador antes de grabar 10 segundos.';
  findRangeDialog.showModal();
});
rangeStartBtn.addEventListener('click', async (ev)=>{
  ev.preventDefault();
  rangeStartBtn.hidden = true;
  try{ await ensureMic(); }catch{ showToast('No se pudo acceder al micrófono.', 'error'); findRangeDialog.close(); return; }
  await engine.resume();
  rangeDialogText.textContent = '🔊 Ejemplo: así es un glissando, deslizando la voz de grave a agudo y de vuelta.';
  await engine.playGlissandoDemo();
  await runCountdown(n=>{ rangeDialogText.textContent = `Prepárate para cantar tu glissando… ${n}`; }, 3);
  rangeDialogText.textContent = 'Grabando 10 segundos… canta desde tu nota más grave a la más aguda.';
  const { minF, maxF } = await recordRangeSample(rangeProgressBar, 10000);
  rangeResult.hidden = false;
  if(minF === Infinity){
    rangeDialogText.textContent = 'No se detectó una voz clara.';
    rangeResult.textContent = 'Intenta de nuevo cantando más cerca del micrófono y con volumen medio.';
  } else {
    const cls = classifyVoiceRange(minF, maxF);
    rangeDialogText.textContent = 'Rango detectado';
    rangeResult.innerHTML = `Nota más grave: <strong>${fmtNote(minF)}</strong><br>Nota más aguda: <strong>${fmtNote(maxF)}</strong><br>Clasificación estimada: <strong>${escapeHtml(cls.label)}</strong>`;
  }
});

/* ================= Onboarding (asistente de bienvenida) ================= */
const onboardingDialog = $('onboardingDialog'), onbText = $('onbText'), onbTypeSelect = $('onbTypeSelect');
const onbStepType = $('onbStepType'), onbStepRecord = $('onbStepRecord'), onbProgressBar = $('onbProgressBar');
const onbResult = $('onbResult'), onbSkipBtn = $('onbSkipBtn'), onbContinueBtn = $('onbContinueBtn');
let onbMode = 'type', onbFinalizeValue = 'soprano';

function finalizeOnboarding(rangeId){
  settings.range = rangeId; settings.onboarded = true; saveSettings(settings);
  rangeSelect.value = rangeId; customRangeLabel.hidden = rangeId !== 'custom';
  onboardingDialog.close(); showToast('¡Listo! Ajustamos los ejercicios a tu voz.');
}
onbContinueBtn.addEventListener('click', async (ev)=>{
  ev.preventDefault();
  if(onbMode === 'result'){ finalizeOnboarding(onbFinalizeValue); onbMode = 'type'; return; }
  const val = onbTypeSelect.value;
  if(val !== 'custom'){ finalizeOnboarding(val); return; }
  onbMode = 'recording';
  onbStepType.hidden = true; onbStepRecord.hidden = false; onbContinueBtn.hidden = true; onbSkipBtn.hidden = true;
  onbProgressBar.style.width = '0%';
  try{ await ensureMic(); }catch{ showToast('No se pudo acceder al micrófono.', 'error'); onboardingDialog.close(); return; }
  await engine.resume();
  onbText.textContent = '🔊 Ejemplo: así es un glissando, deslizando la voz de grave a agudo y de vuelta.';
  await engine.playGlissandoDemo();
  await runCountdown(n=>{ onbText.textContent = `Prepárate para cantar tu glissando… ${n}`; }, 3);
  onbText.textContent = 'Grabando 10 segundos… canta desde tu nota más grave a la más aguda.';
  const { minF, maxF } = await recordRangeSample(onbProgressBar, 10000);
  onbStepRecord.hidden = true; onbContinueBtn.hidden = false; onbSkipBtn.hidden = false;
  onbMode = 'result';
  if(minF === Infinity){
    onbText.textContent = 'No se detectó una voz clara.';
    onbResult.hidden = false; onbResult.textContent = 'Puedes reintentar desde Ajustes → «Repetir asistente de bienvenida».';
    onbFinalizeValue = 'soprano'; onbContinueBtn.textContent = 'Cerrar';
  } else {
    const cls = classifyVoiceRange(minF, maxF);
    onbText.textContent = 'Rango detectado';
    onbResult.hidden = false;
    onbResult.innerHTML = `Nota más grave: <strong>${fmtNote(minF)}</strong><br>Nota más aguda: <strong>${fmtNote(maxF)}</strong><br>Clasificación estimada: <strong>${escapeHtml(cls.label)}</strong>`;
    onbFinalizeValue = cls.id; onbContinueBtn.textContent = `Usar ${cls.label}`;
  }
});
onboardingDialog.addEventListener('close', ()=>{
  if(!settings.onboarded){ settings.onboarded = true; saveSettings(settings); }
  onbMode = 'type'; onbStepType.hidden = false; onbStepRecord.hidden = true; onbResult.hidden = true;
  onbContinueBtn.hidden = false; onbContinueBtn.textContent = 'Continuar'; onbSkipBtn.hidden = false;
  onbText.textContent = 'Para adaptar los ejercicios a tu voz, dinos tu tipo de voz o descúbrelo cantando.';
});

/* ================= Afinador tab: ya conectado arriba (setTunerMode, etc.) ================= */

/* ================= Evaluar ================= */
const evalExerciseSelect = $('evalExerciseSelect'), evalFollowExercise = $('evalFollowExercise'), evalRecordBtn = $('evalRecordBtn');
const importAudioInput = $('importAudioInput'), evalEmpty = $('evalEmpty'), evalResults = $('evalResults');
const evalScoreEl = $('evalScore'), evalAudio = $('evalAudio'), evalPlaySelectionBtn = $('evalPlaySelectionBtn');
const evalCanvas = $('evalCanvas'), evalBreakdown = $('evalBreakdown');
const evalStatus = $('evalStatus');
populatePlainExerciseSelect(evalExerciseSelect);

let evalMediaRecorder = null, manualStopRequested = false;
let currentEvalBuffer = null, currentEvalResult = null, evalSelection = null, evalSourceNode = null;
let currentEvalTrack = null, currentEvalExercise = null;

function buildFreeBreakdown(curve, tolerance){
  const winSize = 0.5;
  const maxT = curve.length ? curve[curve.length-1].t : 0;
  const notes = [];
  for(let start = 0; start < maxT; start += winSize){
    const end = start + winSize;
    const pts = curve.filter(p=> p.t >= start && p.t < end && p.cents !== null);
    let avgCents = null, status = 'sin_datos', label = '--';
    if(pts.length){
      avgCents = pts.reduce((a,b)=> a+b.cents, 0) / pts.length;
      const abs = Math.abs(avgCents);
      status = abs <= tolerance ? 'afinado' : (abs <= tolerance*2.2 ? 'cerca' : 'desafinado');
      const mid = pts[Math.floor(pts.length/2)];
      label = mid.note ? `${mid.note.name}${mid.note.octave}` : '--';
    }
    notes.push({ index:notes.length, start, end, label, avgCents, status, targetMidi:null });
  }
  const afinadas = notes.filter(n=> n.status === 'afinado').length;
  const score = notes.length ? Math.round((afinadas/notes.length)*100) : 0;
  return { notes, score, totalDuration:maxT };
}

async function processEvaluationBlob(blob, ex){
  evalResults.hidden = false; evalEmpty.hidden = true;
  let audioBuffer;
  const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
  try{
    const ab = await blob.arrayBuffer();
    audioBuffer = await decodeCtx.decodeAudioData(ab.slice(0));
  }catch{ showToast('No se pudo decodificar el audio.', 'error'); decodeCtx.close(); return; }
  decodeCtx.close();

  currentEvalBuffer = audioBuffer;
  evalAudio.src = URL.createObjectURL(blob);
  evalSelection = null; evalPlaySelectionBtn.disabled = true; evalPlaySelectionBtn.textContent = '🔁 Reproducir selección en bucle';

  const latencySec = (settings.latencyMs || 0) / 1000;
  let track = buildPitchTrack(audioBuffer, { threshold: (settings.yinThreshold || 10) / 100 });
  if(latencySec > 0) track = track.map(p=> ({ ...p, t: Math.max(0, p.t - latencySec) }));

  let result;
  if(ex){
    result = scoreAgainstExercise(track, ex, getRootMidi(), getSpeed(), { a4: settings.a4, tolerance: settings.tolerance });
  } else {
    const curve = freeIntonationCurve(track, { a4: settings.a4, notation: settings.notation });
    result = buildFreeBreakdown(curve, settings.tolerance);
  }
  currentEvalResult = result; currentEvalTrack = track; currentEvalExercise = ex;
  evalScoreEl.textContent = result.score;
  drawEvalTimeline(result, track, ex);
  renderEvalBreakdown(result.notes);
}

function setEvalControlsDisabled(disabled){
  evalExerciseSelect.disabled = disabled; evalFollowExercise.disabled = disabled; importAudioInput.disabled = disabled;
}

evalRecordBtn.addEventListener('click', async ()=>{
  if(evalRecordBtn.dataset.recording === 'true'){ manualStopRequested = true; evalMediaRecorder.stop(); return; }
  if(evalRecordBtn.dataset.busy === 'true') return; // ya está reproduciendo el ejemplo o contando
  try{ await ensureMic(); }catch{ showToast('No se pudo acceder al micrófono.', 'error'); return; }
  await engine.resume();

  const ex = findExercise(evalExerciseSelect.value);
  const follow = evalFollowExercise.checked && ex;

  evalRecordBtn.dataset.busy = 'true'; evalRecordBtn.disabled = true; setEvalControlsDisabled(true);
  if(evalStatus) evalStatus.textContent = '';

  if(ex){
    evalRecordBtn.textContent = '🔊 Escucha el ejemplo…';
    if(evalStatus) evalStatus.textContent = `Ejemplo: ${ex.nombre}`;
    await new Promise(resolve=>{
      engine.playExercise(ex, getRootMidi(), getSpeed(), { onStep: showSolfege, onDone: ()=>{ clearSolfege(); resolve(); } });
    });
  } else if(evalStatus){
    evalStatus.textContent = 'Prepárate para grabar tu voz.';
  }

  await runCountdown(n=>{ evalRecordBtn.textContent = `${n}…`; if(evalStatus) evalStatus.textContent = `Grabando en ${n}…`; }, 3);

  evalRecordBtn.disabled = false; evalRecordBtn.dataset.busy = 'false'; setEvalControlsDisabled(false);
  if(evalStatus) evalStatus.textContent = follow ? 'Grabando… sigue el ejercicio.' : 'Grabando…';

  const chunks = [];
  evalMediaRecorder = new MediaRecorder(mic.getRecordingStream());
  evalMediaRecorder.ondataavailable = e=>{ if(e.data && e.data.size) chunks.push(e.data); };
  manualStopRequested = false;
  evalMediaRecorder.onstop = async ()=>{
    evalRecordBtn.dataset.recording = 'false'; evalRecordBtn.textContent = '⏺ Grabar'; evalRecordBtn.setAttribute('aria-pressed','false');
    if(evalStatus) evalStatus.textContent = '';
    const blob = new Blob(chunks, { type:'audio/webm' });
    await processEvaluationBlob(blob, follow ? ex : null);
  };
  evalMediaRecorder.start();
  evalRecordBtn.dataset.recording = 'true'; evalRecordBtn.textContent = '■ Detener'; evalRecordBtn.setAttribute('aria-pressed','true');
  if(follow){
    engine.playExercise(ex, getRootMidi(), getSpeed(), { onStep: showSolfege, onDone: ()=>{ clearSolfege(); if(!manualStopRequested) evalMediaRecorder.stop(); } });
  }
});
importAudioInput.addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const ex = evalFollowExercise.checked ? findExercise(evalExerciseSelect.value) : null;
  await processEvaluationBlob(file, ex);
  importAudioInput.value = '';
});

function drawEvalTimeline(result, track, ex){
  const dpr = window.devicePixelRatio || 1;
  const w = evalCanvas.clientWidth, h = evalCanvas.clientHeight;
  evalCanvas.width = w*dpr; evalCanvas.height = h*dpr;
  const ctx2 = evalCanvas.getContext('2d'); ctx2.setTransform(dpr,0,0,dpr,0,0);
  const total = result.totalDuration || (track.length ? track[track.length-1].t : 1) || 1;
  evalCanvas._total = total;
  ctx2.clearRect(0,0,w,h);
  const colors = { afinado:'rgba(111,207,151,0.18)', cerca:'rgba(242,201,76,0.18)', desafinado:'rgba(255,111,97,0.18)', sin_datos:'rgba(184,163,194,0.08)' };
  result.notes.forEach(n=>{
    const x0 = (n.start/total)*w, x1 = (n.end/total)*w;
    ctx2.fillStyle = colors[n.status] || colors.sin_datos;
    ctx2.fillRect(x0, 0, Math.max(1, x1-x0), h);
  });
  ctx2.beginPath(); let started = false;
  track.forEach(p=>{
    if(!p.freq){ started = false; return; }
    const x = (p.t/total)*w;
    let cents = 0;
    if(ex){
      const note = result.notes.find(n=> p.t >= n.start && p.t < n.end);
      cents = note ? (freqToMidiExact(p.freq, settings.a4) - note.targetMidi) * 100 : 0;
    } else {
      const nn = freqToNote(p.freq, { a4: settings.a4, notation: settings.notation });
      cents = nn ? nn.cents : 0;
    }
    const clamped = Math.max(-50, Math.min(50, cents));
    const y = h/2 - (clamped/50) * (h/2 - 6);
    if(!started){ ctx2.moveTo(x,y); started = true; } else ctx2.lineTo(x,y);
  });
  ctx2.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-gold') || '#f0b429';
  ctx2.lineWidth = 1.8; ctx2.stroke();
  ctx2.strokeStyle = 'rgba(255,255,255,0.25)'; ctx2.beginPath(); ctx2.moveTo(0,h/2); ctx2.lineTo(w,h/2); ctx2.stroke();
  if(evalSelection) drawEvalSelectionOverlay();
}
function drawEvalSelectionOverlay(){
  if(!evalSelection || !evalCanvas._total) return;
  const dpr = window.devicePixelRatio || 1;
  const ctx2 = evalCanvas.getContext('2d');
  const w = evalCanvas.width/dpr, h = evalCanvas.height/dpr;
  const x0 = (evalSelection.startSec/evalCanvas._total)*w, x1 = (evalSelection.endSec/evalCanvas._total)*w;
  ctx2.fillStyle = 'rgba(240,180,41,0.22)'; ctx2.fillRect(x0, 0, x1-x0, h);
  ctx2.strokeStyle = 'var(--accent-gold)'; ctx2.strokeRect(x0, 0, x1-x0, h);
}

let dragStartX = null;
evalCanvas.addEventListener('pointerdown', (e)=>{
  if(!evalCanvas._total) return;
  const rect = evalCanvas.getBoundingClientRect();
  dragStartX = e.clientX - rect.left;
});
evalCanvas.addEventListener('pointermove', (e)=>{
  if(dragStartX === null || !evalCanvas._total) return;
  const rect = evalCanvas.getBoundingClientRect();
  const curX = e.clientX - rect.left;
  const w = rect.width;
  const a = Math.min(dragStartX, curX), b = Math.max(dragStartX, curX);
  evalSelection = { startSec: (a/w)*evalCanvas._total, endSec: (b/w)*evalCanvas._total };
  drawEvalTimeline(currentEvalResult, currentEvalTrack, currentEvalExercise);
});
window.addEventListener('pointerup', ()=>{
  if(dragStartX === null) return;
  dragStartX = null;
  evalPlaySelectionBtn.disabled = !(evalSelection && (evalSelection.endSec - evalSelection.startSec) > 0.05);
});

evalPlaySelectionBtn.addEventListener('click', ()=>{
  if(evalSourceNode){ try{ evalSourceNode.stop(); }catch{} evalSourceNode = null; evalPlaySelectionBtn.textContent = '🔁 Reproducir selección en bucle'; return; }
  if(!evalSelection || !currentEvalBuffer) return;
  const src = engine.ctx.createBufferSource();
  src.buffer = currentEvalBuffer; src.loop = true;
  src.loopStart = evalSelection.startSec; src.loopEnd = Math.max(evalSelection.startSec + 0.05, evalSelection.endSec);
  src.connect(engine.master);
  src.start(0, evalSelection.startSec);
  src.onended = ()=>{ evalSourceNode = null; evalPlaySelectionBtn.textContent = '🔁 Reproducir selección en bucle'; };
  evalSourceNode = src;
  evalPlaySelectionBtn.textContent = '■ Detener bucle';
});

function playBufferSegment(startSec, endSec){
  if(!currentEvalBuffer) return;
  const src = engine.ctx.createBufferSource();
  src.buffer = currentEvalBuffer; src.connect(engine.master);
  src.start(0, startSec, Math.max(0.05, endSec - startSec));
}
function playSequenceSegments(list){
  let i = 0;
  const step = ()=>{ if(i >= list.length) return; const n = list[i]; playBufferSegment(n.start, n.end); const dur = (n.end-n.start)*1000; i++; setTimeout(step, dur+120); };
  step();
}
function renderEvalBreakdown(notes){
  evalBreakdown.innerHTML = '';
  notes.forEach(n=>{
    const li = document.createElement('li'); li.className = 'breakdownItem';
    const dot = document.createElement('span'); dot.className = 'dot ' + n.status;
    const lbl = document.createElement('span'); lbl.className = 'bLabel'; lbl.textContent = `${n.label} · ${n.start.toFixed(1)}–${n.end.toFixed(1)}s`;
    const cents = document.createElement('span'); cents.className = 'bCents'; cents.textContent = n.avgCents !== null ? `${Math.round(n.avgCents)}¢` : '—';
    const repeatAll = document.createElement('button'); repeatAll.className = 'btn'; repeatAll.style.padding = '2px 8px'; repeatAll.style.fontSize = '.7rem'; repeatAll.textContent = '🔁 todas';
    repeatAll.title = 'Repetir todas las apariciones de esta nota';
    repeatAll.addEventListener('click', (ev)=>{ ev.stopPropagation(); playSequenceSegments(notes.filter(m=> m.label === n.label && m.status !== 'sin_datos')); });
    li.append(dot, lbl, cents, repeatAll);
    li.title = 'Toca para escuchar este fragmento';
    li.addEventListener('click', ()=> playBufferSegment(n.start, n.end));
    evalBreakdown.appendChild(li);
  });
}

/* ================= Vibrato ================= */
const vibratoDuration = $('vibratoDuration'), vibratoRecordBtn = $('vibratoRecordBtn');
const vibRate = $('vibRate'), vibExtent = $('vibExtent'), vibConsistency = $('vibConsistency');
const vibratoCurveCanvas = $('vibratoCurveCanvas'), vibratoHistoryCanvas = $('vibratoHistoryCanvas');

vibratoRecordBtn.addEventListener('click', async ()=>{
  if(vibratoRecordBtn.dataset.recording === 'true') return;
  try{ await ensureMic(); }catch{ showToast('No se pudo acceder al micrófono.', 'error'); return; }
  const durationSec = Number(vibratoDuration.value);
  const chunks = [];
  const recorder = new MediaRecorder(mic.getRecordingStream());
  recorder.ondataavailable = e=>{ if(e.data && e.data.size) chunks.push(e.data); };
  recorder.onstop = async ()=>{
    vibratoRecordBtn.dataset.recording = 'false'; vibratoRecordBtn.textContent = '⏺ Grabar sostenido'; vibratoRecordBtn.setAttribute('aria-pressed','false');
    const blob = new Blob(chunks, { type:'audio/webm' });
    const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
    try{
      const ab = await blob.arrayBuffer();
      const audioBuffer = await decodeCtx.decodeAudioData(ab.slice(0));
      decodeCtx.close();
      const track = buildPitchTrack(audioBuffer, { frameSize:2048, hop:512 });
      const result = analyzeVibrato(track, { a4: settings.a4 });
      if(!result){ showToast('No se detectó suficiente señal de voz sostenida.', 'error'); return; }
      vibRate.textContent = result.rateHz.toFixed(2) + ' Hz';
      vibExtent.textContent = '±' + result.extentCents.toFixed(0) + ' cents';
      vibConsistency.textContent = Math.round(result.consistency*100) + '%';
      drawVibratoCurve(result.curve);
      await saveVibratoResult({ rateHz: result.rateHz, extentCents: result.extentCents, consistency: result.consistency });
      renderVibratoHistory();
    }catch{ decodeCtx.close(); showToast('No se pudo analizar la grabación.', 'error'); }
  };
  recorder.start();
  vibratoRecordBtn.dataset.recording = 'true'; vibratoRecordBtn.textContent = `■ Grabando… (${durationSec}s)`; vibratoRecordBtn.setAttribute('aria-pressed','true');
  setTimeout(()=> recorder.stop(), durationSec*1000);
});

function drawVibratoCurve(curve){
  const dpr = window.devicePixelRatio || 1;
  const w = vibratoCurveCanvas.clientWidth, h = vibratoCurveCanvas.clientHeight;
  vibratoCurveCanvas.width = w*dpr; vibratoCurveCanvas.height = h*dpr;
  const ctx2 = vibratoCurveCanvas.getContext('2d'); ctx2.setTransform(dpr,0,0,dpr,0,0);
  ctx2.clearRect(0,0,w,h);
  if(!curve.length) return;
  const t0 = curve[0].t, t1 = curve[curve.length-1].t, dur = Math.max(0.001, t1-t0);
  const maxAbs = Math.max(10, ...curve.map(c=> Math.abs(c.cents)));
  ctx2.beginPath();
  curve.forEach((c,i)=>{
    const x = ((c.t-t0)/dur)*w;
    const y = h/2 - (c.cents/maxAbs)*(h/2-6);
    i===0 ? ctx2.moveTo(x,y) : ctx2.lineTo(x,y);
  });
  ctx2.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-rose') || '#e88ac0';
  ctx2.lineWidth = 1.8; ctx2.stroke();
  ctx2.strokeStyle = 'rgba(255,255,255,0.2)'; ctx2.beginPath(); ctx2.moveTo(0,h/2); ctx2.lineTo(w,h/2); ctx2.stroke();
}
async function renderVibratoHistory(){
  const items = await listVibratoHistory();
  const dpr = window.devicePixelRatio || 1;
  const w = vibratoHistoryCanvas.clientWidth, h = vibratoHistoryCanvas.clientHeight;
  vibratoHistoryCanvas.width = w*dpr; vibratoHistoryCanvas.height = h*dpr;
  const ctx2 = vibratoHistoryCanvas.getContext('2d'); ctx2.setTransform(dpr,0,0,dpr,0,0);
  ctx2.clearRect(0,0,w,h);
  if(!items.length) return;
  const maxRate = Math.max(1, ...items.map(i=> i.rateHz));
  const stepX = items.length > 1 ? w/(items.length-1) : w;
  ctx2.beginPath();
  items.forEach((it,i)=>{
    const x = i*stepX, y = h - (it.rateHz/maxRate)*(h-16) - 8;
    i===0 ? ctx2.moveTo(x,y) : ctx2.lineTo(x,y);
  });
  ctx2.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-gold') || '#f0b429';
  ctx2.lineWidth = 2; ctx2.stroke();
  items.forEach((it,i)=>{
    const x = i*stepX, y = h - (it.rateHz/maxRate)*(h-16) - 8;
    ctx2.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent-gold') || '#f0b429';
    ctx2.fillRect(x-2, y-2, 4, 4);
  });
}

/* ================= Rutinas personalizadas ================= */
const routineName = $('routineName'), routineAddSelect = $('routineAddSelect'), routineAddBtn = $('routineAddBtn');
const routineStepsEl = $('routineSteps'), routineSaveBtn = $('routineSaveBtn');
const savedRoutinesList = $('savedRoutinesList'), emptyRoutines = $('emptyRoutines');
populatePlainExerciseSelect(routineAddSelect);
let routineBuilder = [];

function renderRoutineBuilder(){
  routineStepsEl.innerHTML = '';
  routineBuilder.forEach((id, idx)=>{
    const ex = findExercise(id);
    const li = document.createElement('li');
    const span = document.createElement('span'); span.textContent = ex ? ex.nombre : id;
    const rm = document.createElement('button'); rm.textContent = '✕';
    rm.addEventListener('click', ()=>{ routineBuilder.splice(idx,1); renderRoutineBuilder(); });
    li.append(span, rm); routineStepsEl.appendChild(li);
  });
}
routineAddBtn.addEventListener('click', ()=>{ routineBuilder.push(routineAddSelect.value); renderRoutineBuilder(); });
routineSaveBtn.addEventListener('click', ()=>{
  const name = routineName.value.trim();
  if(!name){ showToast('Ponle un nombre a tu rutina.', 'error'); return; }
  if(routineBuilder.length === 0){ showToast('Agrega al menos un ejercicio.', 'error'); return; }
  settings.routines.push({ id:(crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), name, steps: routineBuilder.slice() });
  saveSettings(settings);
  routineBuilder = []; routineName.value = ''; renderRoutineBuilder(); renderSavedRoutines();
  showToast('Rutina guardada.');
});
function renderSavedRoutines(){
  savedRoutinesList.innerHTML = '';
  emptyRoutines.hidden = settings.routines.length > 0;
  settings.routines.forEach(r=>{
    const li = document.createElement('li');
    const meta = document.createElement('div'); meta.className = 'recMeta'; meta.textContent = `${r.name} · ${r.steps.length} ejercicios`;
    const play = document.createElement('button'); play.className = 'btn primary'; play.textContent = '▶ Reproducir';
    play.addEventListener('click', async ()=>{
      await engine.resume(); try{ await ensureMic(); if(!vizRaf) drawViz(); }catch{}
      tabs.find(t=> t.id === 'tab-practicar').click();
      startPlayback(r.steps.slice(), { loop:false });
    });
    const del = document.createElement('button'); del.className = 'btn danger'; del.textContent = 'Eliminar';
    del.addEventListener('click', ()=>{
      settings.routines = settings.routines.filter(x=> x.id !== r.id);
      saveSettings(settings); renderSavedRoutines();
    });
    li.append(meta, play, del); savedRoutinesList.appendChild(li);
  });
}

/* ================= Ajustes: micrófono (dispositivo y sensibilidad) ================= */
const micDeviceSelect = $('micDeviceSelect'), micGainSlider = $('micGainSlider'), micGainVal = $('micGainVal');
const micTestBtn = $('micTestBtn'), micMeterFill = $('micMeterFill');

micGainSlider.value = settings.micGain || 1;
micGainVal.textContent = (Number(micGainSlider.value)).toFixed(1) + '×';

async function refreshMicDeviceList(){
  let devices = [];
  try{ devices = await mic.listInputDevices(); }catch{ devices = []; }
  const current = settings.micDeviceId || '';
  micDeviceSelect.innerHTML = '<option value="">Predeterminado del sistema</option>';
  devices.forEach((d, i)=>{
    const o = document.createElement('option');
    o.value = d.deviceId;
    o.textContent = d.label || `Micrófono ${i+1}`;
    micDeviceSelect.appendChild(o);
  });
  micDeviceSelect.value = [...micDeviceSelect.options].some(o=> o.value === current) ? current : '';
}
refreshMicDeviceList();
if(navigator.mediaDevices && navigator.mediaDevices.addEventListener){
  navigator.mediaDevices.addEventListener('devicechange', refreshMicDeviceList);
}

micDeviceSelect.addEventListener('change', async ()=>{
  settings.micDeviceId = micDeviceSelect.value; saveSettings(settings);
  if(!micReady) return; // se aplicará cuando se abra el micrófono la próxima vez
  try{
    await mic.switchDevice(settings.micDeviceId || undefined);
    mic.setSensitivity(settings.micGain || 1);
    showToast('Micrófono cambiado.');
    await refreshMicDeviceList();
  }catch{ showToast('No se pudo cambiar de micrófono.', 'error'); }
});

micGainSlider.addEventListener('input', ()=>{
  const v = Number(micGainSlider.value) || 1;
  micGainVal.textContent = v.toFixed(1) + '×';
  settings.micGain = v; saveSettings(settings);
  mic.setSensitivity(v);
});

let micMeterRaf = null;
function stopMicMeter(){
  if(micMeterRaf) cancelAnimationFrame(micMeterRaf);
  micMeterRaf = null;
  micMeterFill.style.width = '0%';
  micTestBtn.textContent = '🎙 Probar micrófono'; micTestBtn.setAttribute('aria-pressed','false');
}
function startMicMeter(){
  const buf = new Float32Array(mic.analyser.fftSize);
  const tick = ()=>{
    mic.getFloatTimeDomainData(buf);
    const level = rms(buf);
    const pct = Math.min(100, level * 400); // escala visual aproximada
    micMeterFill.style.width = pct + '%';
    micMeterRaf = requestAnimationFrame(tick);
  };
  tick();
}
micTestBtn.addEventListener('click', async ()=>{
  if(micMeterRaf){ stopMicMeter(); return; }
  try{ await ensureMic(); }catch{ showToast('No se pudo acceder al micrófono.', 'error'); return; }
  await refreshMicDeviceList();
  micTestBtn.textContent = '■ Detener prueba'; micTestBtn.setAttribute('aria-pressed','true');
  startMicMeter();
});

/* ================= Ajustes ================= */
const notationSelect = $('notationSelect'), a4Slider = $('a4Tuning'), a4Val = $('a4Val');
const toleranceSlider = $('toleranceSlider'), toleranceVal = $('toleranceVal');
const latencySlider = $('latencySlider'), latencyVal = $('latencyVal');
const skipOnboardingCheck = $('skipOnboarding'), repeatOnboardingBtn = $('repeatOnboardingBtn');

notationSelect.value = settings.notation;
a4Slider.value = settings.a4; a4Val.innerHTML = `${settings.a4} <small>Hz</small>`;
toleranceSlider.value = settings.tolerance; toleranceVal.innerHTML = `${settings.tolerance} <small>cents</small>`;
latencySlider.value = settings.latencyMs; latencyVal.innerHTML = `${settings.latencyMs} <small>ms</small>`;
skipOnboardingCheck.checked = settings.skipOnboarding;

notationSelect.addEventListener('change', ()=>{ settings.notation = notationSelect.value; saveSettings(settings); populateTunerNoteSelect(); updateTransposeDisplay(); });
a4Slider.addEventListener('input', ()=>{ a4Val.innerHTML = `${a4Slider.value} <small>Hz</small>`; settings.a4 = Number(a4Slider.value); saveSettings(settings); });
toleranceSlider.addEventListener('input', ()=>{ toleranceVal.innerHTML = `${toleranceSlider.value} <small>cents</small>`; settings.tolerance = Number(toleranceSlider.value); saveSettings(settings); });
latencySlider.addEventListener('input', ()=>{ latencyVal.innerHTML = `${latencySlider.value} <small>ms</small>`; settings.latencyMs = Number(latencySlider.value); saveSettings(settings); });
skipOnboardingCheck.addEventListener('change', ()=>{ settings.skipOnboarding = skipOnboardingCheck.checked; saveSettings(settings); });
repeatOnboardingBtn.addEventListener('click', ()=>{
  settings.onboarded = false; saveSettings(settings);
  onbTypeSelect.value = 'soprano';
  onboardingDialog.showModal();
});

/* ================= Inicialización ================= */
renderCategoryChips();
renderExerciseList();
renderProgressions();
renderRoutineBuilder();

if(!settings.onboarded && !settings.skipOnboarding){
  onboardingDialog.showModal();
}

/* ================= PWA: service worker ================= */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{ /* offline-first best effort */ });
  });
}
