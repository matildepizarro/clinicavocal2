// sw.js — cachea el "app shell" para que Vocalizer 2026 funcione completamente offline
// tras la primera visita. Estrategia: cache-first con actualización en segundo plano.

const CACHE_NAME = 'vocalizer2026-v3';
const PIANO_NOTES = ['A0','C1','Ds1','Fs1','A1','C2','Ds2','Fs2','A2','C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4','C5','Ds5','Fs5','A5','C6','Ds6','Fs6','A6','C7','Ds7','Fs7','A7','C8'];
const ASSETS = [
  './', './index.html', './style.css',
  './js/app.js', './js/audio.js', './js/exercises.js', './js/mic.js',
  './js/pitch.js', './js/storage.js', './js/wav-encoder.js', './js/analysis.js',
  './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './assets/metronome_click.wav', './assets/demo_exercise_1.wav',
  './assets/pickup_note.wav', './assets/scale_C_major.wav',
  ...PIANO_NOTES.map(n => `./assets/piano-samples/${n}.mp3`)
];

self.addEventListener('install', (event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', (event)=>{
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached=>{
      const network = fetch(event.request).then(res=>{
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      }).catch(()=> cached);
      return cached || network;
    })
  );
});
