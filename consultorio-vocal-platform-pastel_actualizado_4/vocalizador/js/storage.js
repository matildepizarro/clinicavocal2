// storage.js — persistencia local: IndexedDB para grabaciones (blobs), localStorage para ajustes.

const DB_NAME = 'vocalizer2026';
const STORE = 'recordings';
const VIBRATO_STORE = 'vibratoHistory';
const SETTINGS_KEY = 'vocalizer2026:settings';

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains(STORE)){
        const store = db.createObjectStore(STORE, { keyPath:'id' });
        store.createIndex('createdAt', 'createdAt');
      }
      if(!db.objectStoreNames.contains(VIBRATO_STORE)){
        const store = db.createObjectStore(VIBRATO_STORE, { keyPath:'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVibratoResult({ rateHz, extentCents, consistency }){
  const db = await openDB();
  const record = { id:(crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+Math.random()), rateHz, extentCents, consistency, createdAt: Date.now() };
  await new Promise((resolve, reject)=>{
    const tx = db.transaction(VIBRATO_STORE, 'readwrite');
    tx.objectStore(VIBRATO_STORE).put(record);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
  return record;
}

export async function listVibratoHistory(){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(VIBRATO_STORE, 'readonly');
    const req = tx.objectStore(VIBRATO_STORE).getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a,b)=> a.createdAt - b.createdAt));
    req.onerror = () => reject(req.error);
  });
}

export async function saveRecording({ blob, mimeType, durationSec, exerciseName }){
  const db = await openDB();
  const record = {
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
    blob, mimeType, durationSec: durationSec || null,
    exerciseName: exerciseName || null,
    createdAt: Date.now()
  };
  await new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
  return record;
}

export async function listRecordings(){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a,b)=> b.createdAt - a.createdAt));
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRecording(id){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}

export async function clearRecordings(){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}

export function loadSettings(defaults){
  try{
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  }catch{
    return { ...defaults };
  }
}

export function saveSettings(settings){
  try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }catch{ /* storage full or disabled: fail silently */ }
}
