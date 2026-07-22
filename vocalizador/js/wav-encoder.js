// wav-encoder.js — codifica un AudioBuffer a WAV PCM 16-bit.
// Se usa para ofrecer descargas .wav universales además del .webm nativo de MediaRecorder.

export function audioBufferToWav(audioBuffer){
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, str){
    for(let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels = [];
  for(let ch = 0; ch < numChannels; ch++) channels.push(audioBuffer.getChannelData(ch));

  let offset = 44;
  for(let i = 0; i < numFrames; i++){
    for(let ch = 0; ch < numChannels; ch++){
      let sample = Math.max(-1, Math.min(1, channels[ch][i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type:'audio/wav' });
}

/** Decodifica un Blob (p. ej. webm/opus) a WAV usando un OfflineAudioContext. */
export async function blobToWav(blob){
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 1, 44100);
  const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
  try{
    const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
    return audioBufferToWav(audioBuffer);
  } finally {
    decodeCtx.close();
  }
}
