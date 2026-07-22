// pitch.js — detección de altura (YIN) y utilidades de nota
// Implementación propia y compacta del algoritmo YIN (de Cheveigné & Kawahara, 2002).
// Para uso intensivo en producción existen librerías probadas (p. ej. pitchfinder, yinjs);
// esta versión está optimizada para correr suave en el hilo principal de un navegador de 2026.

export const SOLFEGE_NAMES = ['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'];
export const LETTER_NAMES  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export function midiToFreq(midi, a4 = 440){
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidiExact(freq, a4 = 440){
  return 69 + 12 * Math.log2(freq / a4);
}

export function freqToNote(freq, { a4 = 440, notation = 'solfege' } = {}){
  if(!freq || freq <= 0 || !isFinite(freq)) return null;
  const midi = freqToMidiExact(freq, a4);
  const rounded = Math.round(midi);
  const names = notation === 'letters' ? LETTER_NAMES : SOLFEGE_NAMES;
  const name = names[(rounded + 1200) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  const cents = Math.round((midi - rounded) * 100);
  return { name, octave, midi: rounded, cents, freq };
}

/** Root-mean-square amplitude, used to gate silence so the tuner doesn't chase noise. */
export function rms(buffer){
  let sum = 0;
  for(let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

/**
 * YIN pitch detector.
 * @param {Float32Array} buffer time-domain samples
 * @param {number} sampleRate
 * @param {number} threshold absolute threshold (default 0.10, lower = stricter)
 * @returns {number} frequency in Hz, or -1 if no clear pitch found
 */
export function yinDetect(buffer, sampleRate, threshold = 0.10){
  const size = buffer.length;
  const halfSize = Math.floor(size / 2);
  const yinBuffer = new Float32Array(halfSize);

  // 1) difference function
  for(let tau = 0; tau < halfSize; tau++){
    let sum = 0;
    for(let i = 0; i < halfSize; i++){
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  // 2) cumulative mean normalized difference function
  let runningSum = 0;
  yinBuffer[0] = 1;
  for(let tau = 1; tau < halfSize; tau++){
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = runningSum === 0 ? 1 : yinBuffer[tau] * tau / runningSum;
  }

  // 3) absolute threshold — first dip below threshold, walk to its local minimum
  let tauEstimate = -1;
  for(let tau = 2; tau < halfSize; tau++){
    if(yinBuffer[tau] < threshold){
      while(tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) tau++;
      tauEstimate = tau;
      break;
    }
  }
  if(tauEstimate === -1) return -1;

  // 4) parabolic interpolation for sub-sample precision
  let betterTau = tauEstimate;
  if(tauEstimate > 0 && tauEstimate < halfSize - 1){
    const s0 = yinBuffer[tauEstimate - 1];
    const s1 = yinBuffer[tauEstimate];
    const s2 = yinBuffer[tauEstimate + 1];
    const denom = (2 * s1 - s2 - s0);
    if(denom !== 0) betterTau = tauEstimate + (s2 - s0) / (2 * denom);
  }

  const freq = sampleRate / betterTau;
  if(freq < 60 || freq > 1500) return -1; // rango vocal humano razonable
  return freq;
}
