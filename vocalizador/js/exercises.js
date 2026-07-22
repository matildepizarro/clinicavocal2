// exercises.js — biblioteca de ejercicios, categorías y progresiones guiadas.

export const CATEGORIES = [
  { id:'mayor', nombre:'Escalas mayores' },
  { id:'menor', nombre:'Escalas menores' },
  { id:'pentatonica', nombre:'Pentatónicas' },
  { id:'cromatica', nombre:'Cromáticas' },
  { id:'intervalos', nombre:'Intervalos' },
  { id:'arpegios', nombre:'Arpegios' },
  { id:'tecnica', nombre:'Técnica vocal' }
];

// pattern: semitonos relativos a la nota raíz. stepDur: segundos por paso a velocidad 1.0x.
// type 'step' = notas separadas (staccato/legato corto). type 'glide' = portamento continuo
// entre los puntos del patrón (para sirenas y lip trill).
export const EXERCISES = [
  // --- Mayores ---
  { id:'maj_3tone', nombre:'Escala mayor (3 tonos)', descripcion:'Do Re Mi Re Do', categoria:'mayor', nivel:'Iniciación', pattern:[0,2,4,2,0], stepDur:0.5, type:'step' },
  { id:'scale_5_asc', nombre:'Escala 5 tonos (ascendente)', descripcion:'Do Re Mi Fa Sol Fa Mi Re Do', categoria:'mayor', nivel:'Básico', pattern:[0,2,4,5,7,5,4,2,0], stepDur:0.45, type:'step' },
  { id:'scale_5_desc', nombre:'Escala 5 tonos (descendente)', descripcion:'Sol Fa Mi Re Do', categoria:'mayor', nivel:'Básico', pattern:[7,5,4,2,0], stepDur:0.5, type:'step' },
  { id:'octave_scale', nombre:'Escala de octava completa', descripcion:'Do Re Mi Fa Sol La Si Do — sube y baja', categoria:'mayor', nivel:'Intermedio', pattern:[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0], stepDur:0.35, type:'step' },
  { id:'ninth_run', nombre:'Recorrido a la novena', descripcion:'Extensión de rango hasta el Re agudo', categoria:'mayor', nivel:'Avanzado', pattern:[0,2,4,5,7,9,11,12,14,12,11,9,7,5,4,2,0], stepDur:0.3, type:'step' },
  { id:'tonic_dominant', nombre:'Tónica – Dominante', descripcion:'Do Sol Do Sol', categoria:'mayor', nivel:'Iniciación', pattern:[0,7,0,7], stepDur:0.5, type:'step' },
  { id:'do_re_do', nombre:'Do Re Do (articulación)', descripcion:'Do Re Do / Do Re Mi Re Do', categoria:'mayor', nivel:'Básico', pattern:[0,2,0,0,2,4,2,0], stepDur:0.35, type:'step' },
  { id:'do_ti_do', nombre:'Do Si Do (sensible)', descripcion:'Do Si Do / Do Si La Si Do', categoria:'mayor', nivel:'Intermedio', pattern:[0,-1,0,0,-1,-3,-1,0], stepDur:0.35, type:'step' },
  { id:'solfege_sequence', nombre:'Secuencia de solfeo escalonada', descripcion:'Sube por grados hasta la octava', categoria:'mayor', nivel:'Avanzado', pattern:[0,2,0,2,4,0,2,4,5,0,2,4,5,7], stepDur:0.28, type:'step' },
  { id:'staccato_5', nombre:'Staccato de 5 notas', descripcion:'Do Mi Sol Mi Do, ataques cortos', categoria:'mayor', nivel:'Intermedio', pattern:[0,4,7,4,0], stepDur:0.28, type:'step' },

  // --- Menores ---
  { id:'minor_3tone', nombre:'Escala menor (3 tonos)', descripcion:'Do Re Mib Re Do', categoria:'menor', nivel:'Iniciación', pattern:[0,2,3,2,0], stepDur:0.5, type:'step' },
  { id:'natural_minor_scale', nombre:'Escala menor natural completa', descripcion:'Do Re Mib Fa Sol Lab Sib Do — sube y baja', categoria:'menor', nivel:'Intermedio', pattern:[0,2,3,5,7,8,10,12,10,8,7,5,3,2,0], stepDur:0.32, type:'step' },
  { id:'harmonic_minor_scale', nombre:'Escala menor armónica', descripcion:'Con sensible elevada (Si natural)', categoria:'menor', nivel:'Avanzado', pattern:[0,2,3,5,7,8,11,12,11,8,7,5,3,2,0], stepDur:0.32, type:'step' },
  { id:'minor_mel_5', nombre:'Melodía menor de 5 tonos', descripcion:'Do Mib Re Fa Mib Sol Fa Re Do', categoria:'menor', nivel:'Básico', pattern:[0,3,2,5,3,7,5,2,0], stepDur:0.45, type:'step' },

  // --- Pentatónicas ---
  { id:'pentatonic_major_asc', nombre:'Pentatónica mayor (ascendente)', descripcion:'Do Re Mi Sol La Do', categoria:'pentatonica', nivel:'Básico', pattern:[0,2,4,7,9,12], stepDur:0.4, type:'step' },
  { id:'pentatonic_major_run', nombre:'Pentatónica mayor completa', descripcion:'Sube y baja por la escala de 5 notas', categoria:'pentatonica', nivel:'Intermedio', pattern:[0,2,4,7,9,12,9,7,4,2,0], stepDur:0.35, type:'step' },
  { id:'pentatonic_minor_run', nombre:'Pentatónica menor completa', descripcion:'Do Mib Fa Sol Sib Do, sube y baja', categoria:'pentatonica', nivel:'Intermedio', pattern:[0,3,5,7,10,12,10,7,5,3,0], stepDur:0.35, type:'step' },

  // --- Cromáticas ---
  { id:'chromatic_run_up', nombre:'Cromática ascendente', descripcion:'Los 12 semitonos, uno a uno, hacia arriba', categoria:'cromatica', nivel:'Avanzado', pattern:[0,1,2,3,4,5,6,7,8,9,10,11,12], stepDur:0.25, type:'step' },
  { id:'chromatic_run_updown', nombre:'Cromática completa (sube y baja)', descripcion:'Los 12 semitonos, ida y vuelta', categoria:'cromatica', nivel:'Avanzado', pattern:[0,1,2,3,4,5,6,7,8,9,10,11,12,11,10,9,8,7,6,5,4,3,2,1,0], stepDur:0.22, type:'step' },

  // --- Intervalos ---
  { id:'interval_2nd', nombre:'Intervalo de 2ª', descripcion:'Do – Re – Do', categoria:'intervalos', nivel:'Iniciación', pattern:[0,2,0], stepDur:0.6, type:'step' },
  { id:'interval_3rd', nombre:'Intervalo de 3ª', descripcion:'Do – Mi – Do', categoria:'intervalos', nivel:'Iniciación', pattern:[0,4,0], stepDur:0.6, type:'step' },
  { id:'interval_4th', nombre:'Intervalo de 4ª', descripcion:'Do – Fa – Do', categoria:'intervalos', nivel:'Básico', pattern:[0,5,0], stepDur:0.6, type:'step' },
  { id:'interval_5th', nombre:'Intervalo de 5ª', descripcion:'Do – Sol – Do', categoria:'intervalos', nivel:'Básico', pattern:[0,7,0], stepDur:0.6, type:'step' },
  { id:'interval_6th', nombre:'Intervalo de 6ª', descripcion:'Do – La – Do', categoria:'intervalos', nivel:'Intermedio', pattern:[0,9,0], stepDur:0.6, type:'step' },
  { id:'interval_7th', nombre:'Intervalo de 7ª', descripcion:'Do – Si – Do', categoria:'intervalos', nivel:'Intermedio', pattern:[0,11,0], stepDur:0.6, type:'step' },
  { id:'interval_octave', nombre:'Intervalo de 8ª (octava)', descripcion:'Do – Do agudo – Do', categoria:'intervalos', nivel:'Avanzado', pattern:[0,12,0], stepDur:0.6, type:'step' },

  // --- Arpegios ---
  { id:'maj_arpeggio_1', nombre:'Arpegio mayor I', descripcion:'Do Mi Sol Do', categoria:'arpegios', nivel:'Básico', pattern:[0,4,7,12], stepDur:0.6, type:'step' },
  { id:'maj_arpeggio_2', nombre:'Arpegio mayor II', descripcion:'Do Sol Mi Do Sol Mi Do', categoria:'arpegios', nivel:'Intermedio', pattern:[0,7,4,0,7,4,0], stepDur:0.4, type:'step' },
  { id:'arpeggio_extended', nombre:'Arpegio mayor extendido', descripcion:'Do Mi Sol Do Sol Mi Do', categoria:'arpegios', nivel:'Avanzado', pattern:[0,4,7,12,7,4,0], stepDur:0.45, type:'step' },
  { id:'minor_arpeggio', nombre:'Arpegio menor', descripcion:'Do Mib Sol Do Sol Mib Do', categoria:'arpegios', nivel:'Intermedio', pattern:[0,3,7,12,7,3,0], stepDur:0.45, type:'step' },
  { id:'dominant7_arpeggio', nombre:'Arpegio de dominante (7ª)', descripcion:'Do Mi Sol Sib Do', categoria:'arpegios', nivel:'Avanzado', pattern:[0,4,7,10,12], stepDur:0.45, type:'step' },
  { id:'diminished_arpeggio', nombre:'Arpegio disminuido', descripcion:'Do Mib Solb Do', categoria:'arpegios', nivel:'Avanzado', pattern:[0,3,6,9,12], stepDur:0.45, type:'step' },

  // --- Técnica vocal ---
  { id:'tech_mum', nombre:'Mum', descripcion:'Resonancia con consonante nasal cerrada', categoria:'tecnica', nivel:'Iniciación', pattern:[0,2,4,2,0], stepDur:0.5, type:'step', syllable:'Mum' },
  { id:'tech_nay', nombre:'Ney (Nay)', descripcion:'Colocación frontal, sonido brillante', categoria:'tecnica', nivel:'Básico', pattern:[0,4,7,4,0], stepDur:0.5, type:'step', syllable:'Ney' },
  { id:'tech_lip_trill', nombre:'Lip Trill (vibración de labios)', descripcion:'Relaja la laringe, portamento continuo', categoria:'tecnica', nivel:'Intermedio', pattern:[0,4,7,12,7,4,0], stepDur:0.5, type:'glide', syllable:'Brr…' },
  { id:'tech_siren', nombre:'Siren (Ng)', descripcion:'Desliza suavemente por todo tu rango cómodo', categoria:'tecnica', nivel:'Intermedio', pattern:[0,12,0], stepDur:1.4, type:'glide', syllable:'Ng…' }
];

// Progresiones guiadas: encadenan varios ejercicios para una rutina completa.
export const PROGRESSIONS = [
  { id:'warmup_basico', nombre:'Calentamiento básico', steps:['tech_mum','maj_3tone','tonic_dominant','maj_arpeggio_1'] },
  { id:'rango_medio', nombre:'Desarrollo de rango medio', steps:['scale_5_asc','pentatonic_major_asc','octave_scale','interval_5th'] },
  { id:'tecnica_avanzada', nombre:'Técnica avanzada', steps:['tech_lip_trill','tech_siren','chromatic_run_up','ninth_run'] },
  { id:'flexibilidad', nombre:'Flexibilidad y agilidad', steps:['staccato_5','pentatonic_minor_run','dominant7_arpeggio','chromatic_run_updown'] }
];

const SOLFEGE_MAP = {0:'Do',1:'Do#',2:'Re',3:'Re#',4:'Mi',5:'Fa',6:'Fa#',7:'Sol',8:'Sol#',9:'La',10:'La#',11:'Si',12:'Do',14:'Re','-1':'Si','-3':'La'};

/** Convierte un intervalo (en semitonos) del patrón a una sílaba de solfeo aproximada. */
export function intervalToSolfeggio(interval){
  if(interval in SOLFEGE_MAP) return SOLFEGE_MAP[interval];
  const mod = ((interval % 12) + 12) % 12;
  return SOLFEGE_MAP[mod] || '?';
}

export function findExercise(id){ return EXERCISES.find(e=> e.id === id) || null; }

/** Duración total (segundos) de un ejercicio a una velocidad dada (1.0 = normal). */
export function exerciseDuration(exercise, speed = 1.0){
  const steps = exercise.pattern.length;
  return (steps * (exercise.stepDur || 0.45)) / speed;
}
