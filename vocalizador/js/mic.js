// mic.js — gestiona un único MediaStream de micrófono compartido por toda la app
// (el original abría un getUserMedia distinto para grabar, para "encontrar rango" y para
// el visualizador, lo que en algunos navegadores dispara el indicador de mic varias veces
// y puede fallar en móvil). Aquí se abre una sola vez y se reutiliza.
//
// Añadido: selección de dispositivo de entrada (deviceId) y control de sensibilidad
// (ganancia de entrada). La ganancia se aplica con un GainNode ANTES del analizador
// (afinador/medidor) y también antes de un MediaStreamDestination que produce el stream
// "procesado" que usan las grabaciones (MediaRecorder), para que la sensibilidad afecte
// tanto a la detección en vivo como a lo que realmente se grabe.

export class MicManager{
  constructor(audioCtx){
    this.audioCtx = audioCtx;
    this.stream = null;
    this.sourceNode = null;
    this.deviceId = null;

    this.gainNode = audioCtx.createGain();
    this.gainNode.gain.value = 1;

    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;

    // Destino que produce un MediaStream "post-ganancia" para usar en MediaRecorder.
    this.destNode = audioCtx.createMediaStreamDestination();

    this.gainNode.connect(this.analyser);
    this.gainNode.connect(this.destNode);
  }

  /** Abre el micrófono (o lo reabre en otro dispositivo) si aún no está listo. */
  async ensure(deviceId){
    if(this.stream && (!deviceId || deviceId === this.deviceId)) return this.stream;
    await this._open(deviceId);
    return this.stream;
  }

  /** Cambia a otro dispositivo de entrada explícitamente (requiere que ya haya permiso). */
  async switchDevice(deviceId){
    await this._open(deviceId);
    return this.stream;
  }

  async _open(deviceId){
    const audioConstraints = { echoCancellation:false, noiseSuppression:false, autoGainControl:false };
    if(deviceId) audioConstraints.deviceId = { exact: deviceId };
    const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
    // Cierra la fuente y las pistas anteriores antes de reemplazarlas.
    if(this.sourceNode){ try{ this.sourceNode.disconnect(); }catch{} }
    if(this.stream){ this.stream.getTracks().forEach(t=> t.stop()); }
    this.stream = stream;
    this.deviceId = deviceId || null;
    this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
    this.sourceNode.connect(this.gainNode);
  }

  /** value: factor de ganancia (1 = normal, >1 = más sensible, <1 = menos sensible). */
  setSensitivity(value){
    const v = Math.max(0.1, Math.min(4, Number(value) || 1));
    this.gainNode.gain.setTargetAtTime(v, this.audioCtx.currentTime, 0.01);
  }
  getSensitivity(){ return this.gainNode.gain.value; }

  /** Stream a usar en MediaRecorder: incluye la ganancia aplicada. */
  getRecordingStream(){ return this.destNode.stream; }

  /** Lista los micrófonos disponibles (labels solo visibles tras conceder permiso). */
  async listInputDevices(){
    try{
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d=> d.kind === 'audioinput');
    }catch{ return []; }
  }

  getFloatTimeDomainData(target){
    this.analyser.getFloatTimeDomainData(target);
  }
}
