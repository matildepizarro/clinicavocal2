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

/* ============================================================
   Traducción de nombres/descripciones/niveles (PT / EN).
   El español vive directamente en CATEGORIES/EXERCISES/PROGRESSIONS
   de arriba y sirve de fallback si falta una clave.
   Los nombres de nota en las descripciones (Do Re Mi...) se mantienen
   en solfeo romance también en inglés, por ser la convención habitual
   de solfeo movible en pedagogía vocal en cualquier idioma.
   ============================================================ */
export const LEVEL_I18N = {
  'Iniciación': { pt:'Iniciação', en:'Beginner' },
  'Básico':     { pt:'Básico',    en:'Basic' },
  'Intermedio': { pt:'Intermediário', en:'Intermediate' },
  'Avanzado':   { pt:'Avançado', en:'Advanced' }
};

export const CATEGORY_I18N = {
  mayor:       { pt:'Escalas maiores',    en:'Major scales' },
  menor:       { pt:'Escalas menores',    en:'Minor scales' },
  pentatonica: { pt:'Pentatônicas',       en:'Pentatonic' },
  cromatica:   { pt:'Cromáticas',         en:'Chromatic' },
  intervalos:  { pt:'Intervalos',         en:'Intervals' },
  arpegios:    { pt:'Arpejos',            en:'Arpeggios' },
  tecnica:     { pt:'Técnica vocal',      en:'Vocal technique' }
};

export const EXERCISE_I18N = {
  maj_3tone:            { pt:{ nombre:'Escala maior (3 tons)', descripcion:'Do Ré Mi Ré Do' },                              en:{ nombre:'Major scale (3 tones)', descripcion:'Do Re Mi Re Do' } },
  scale_5_asc:          { pt:{ nombre:'Escala de 5 tons (ascendente)', descripcion:'Do Ré Mi Fá Sol Fá Mi Ré Do' },          en:{ nombre:'5-tone scale (ascending)', descripcion:'Do Re Mi Fa Sol Fa Mi Re Do' } },
  scale_5_desc:          { pt:{ nombre:'Escala de 5 tons (descendente)', descripcion:'Sol Fá Mi Ré Do' },                    en:{ nombre:'5-tone scale (descending)', descripcion:'Sol Fa Mi Re Do' } },
  octave_scale:          { pt:{ nombre:'Escala de oitava completa', descripcion:'Do Ré Mi Fá Sol Lá Si Do — sobe e desce' }, en:{ nombre:'Full octave scale', descripcion:'Do Re Mi Fa Sol La Ti Do — up and down' } },
  ninth_run:             { pt:{ nombre:'Percurso até a nona', descripcion:'Extensão da tessitura até o Ré agudo' },         en:{ nombre:'Run to the ninth', descripcion:'Range extension up to the high Re' } },
  tonic_dominant:        { pt:{ nombre:'Tônica – Dominante', descripcion:'Do Sol Do Sol' },                                  en:{ nombre:'Tonic – Dominant', descripcion:'Do Sol Do Sol' } },
  do_re_do:              { pt:{ nombre:'Do Ré Do (articulação)', descripcion:'Do Ré Do / Do Ré Mi Ré Do' },                 en:{ nombre:'Do Re Do (articulation)', descripcion:'Do Re Do / Do Re Mi Re Do' } },
  do_ti_do:              { pt:{ nombre:'Do Si Do (sensível)', descripcion:'Do Si Do / Do Si Lá Si Do' },                    en:{ nombre:'Do Ti Do (leading tone)', descripcion:'Do Ti Do / Do Ti La Ti Do' } },
  solfege_sequence:      { pt:{ nombre:'Sequência de solfejo escalonada', descripcion:'Sobe em graus até a oitava' },       en:{ nombre:'Stepwise solfège sequence', descripcion:'Climbs step by step to the octave' } },
  staccato_5:            { pt:{ nombre:'Staccato de 5 notas', descripcion:'Do Mi Sol Mi Do, ataques curtos' },              en:{ nombre:'5-note staccato', descripcion:'Do Mi Sol Mi Do, short attacks' } },

  minor_3tone:           { pt:{ nombre:'Escala menor (3 tons)', descripcion:'Do Ré Mib Ré Do' },                            en:{ nombre:'Minor scale (3 tones)', descripcion:'Do Re Me Re Do' } },
  natural_minor_scale:   { pt:{ nombre:'Escala menor natural completa', descripcion:'Do Ré Mib Fá Sol Lab Sib Do — sobe e desce' }, en:{ nombre:'Full natural minor scale', descripcion:'Do Re Me Fa Sol Le Te Do — up and down' } },
  harmonic_minor_scale:  { pt:{ nombre:'Escala menor harmônica', descripcion:'Com sensível elevada (Si natural)' },         en:{ nombre:'Harmonic minor scale', descripcion:'With a raised leading tone (natural Ti)' } },
  minor_mel_5:           { pt:{ nombre:'Melodia menor de 5 tons', descripcion:'Do Mib Ré Fá Mib Sol Fá Ré Do' },            en:{ nombre:'5-tone minor melody', descripcion:'Do Me Re Fa Me Sol Fa Re Do' } },

  pentatonic_major_asc:  { pt:{ nombre:'Pentatônica maior (ascendente)', descripcion:'Do Ré Mi Sol Lá Do' },                en:{ nombre:'Major pentatonic (ascending)', descripcion:'Do Re Mi Sol La Do' } },
  pentatonic_major_run:  { pt:{ nombre:'Pentatônica maior completa', descripcion:'Sobe e desce pela escala de 5 notas' },   en:{ nombre:'Full major pentatonic', descripcion:'Climbs and descends the 5-note scale' } },
  pentatonic_minor_run:  { pt:{ nombre:'Pentatônica menor completa', descripcion:'Do Mib Fá Sol Sib Do, sobe e desce' },    en:{ nombre:'Full minor pentatonic', descripcion:'Do Me Fa Sol Te Do, up and down' } },

  chromatic_run_up:      { pt:{ nombre:'Cromática ascendente', descripcion:'Os 12 semitons, um a um, subindo' },            en:{ nombre:'Ascending chromatic run', descripcion:'All 12 semitones, one by one, going up' } },
  chromatic_run_updown:  { pt:{ nombre:'Cromática completa (sobe e desce)', descripcion:'Os 12 semitons, ida e volta' },    en:{ nombre:'Full chromatic run (up and down)', descripcion:'All 12 semitones, there and back' } },

  interval_2nd:          { pt:{ nombre:'Intervalo de 2ª', descripcion:'Do – Ré – Do' },   en:{ nombre:'2nd interval', descripcion:'Do – Re – Do' } },
  interval_3rd:          { pt:{ nombre:'Intervalo de 3ª', descripcion:'Do – Mi – Do' },   en:{ nombre:'3rd interval', descripcion:'Do – Mi – Do' } },
  interval_4th:          { pt:{ nombre:'Intervalo de 4ª', descripcion:'Do – Fá – Do' },   en:{ nombre:'4th interval', descripcion:'Do – Fa – Do' } },
  interval_5th:          { pt:{ nombre:'Intervalo de 5ª', descripcion:'Do – Sol – Do' },  en:{ nombre:'5th interval', descripcion:'Do – Sol – Do' } },
  interval_6th:          { pt:{ nombre:'Intervalo de 6ª', descripcion:'Do – Lá – Do' },   en:{ nombre:'6th interval', descripcion:'Do – La – Do' } },
  interval_7th:          { pt:{ nombre:'Intervalo de 7ª', descripcion:'Do – Si – Do' },   en:{ nombre:'7th interval', descripcion:'Do – Ti – Do' } },
  interval_octave:       { pt:{ nombre:'Intervalo de 8ª (oitava)', descripcion:'Do – Do agudo – Do' }, en:{ nombre:'Octave interval (8th)', descripcion:'Do – high Do – Do' } },

  maj_arpeggio_1:        { pt:{ nombre:'Arpejo maior I', descripcion:'Do Mi Sol Do' },                     en:{ nombre:'Major arpeggio I', descripcion:'Do Mi Sol Do' } },
  maj_arpeggio_2:        { pt:{ nombre:'Arpejo maior II', descripcion:'Do Sol Mi Do Sol Mi Do' },          en:{ nombre:'Major arpeggio II', descripcion:'Do Sol Mi Do Sol Mi Do' } },
  arpeggio_extended:     { pt:{ nombre:'Arpejo maior estendido', descripcion:'Do Mi Sol Do Sol Mi Do' },   en:{ nombre:'Extended major arpeggio', descripcion:'Do Mi Sol Do Sol Mi Do' } },
  minor_arpeggio:        { pt:{ nombre:'Arpejo menor', descripcion:'Do Mib Sol Do Sol Mib Do' },           en:{ nombre:'Minor arpeggio', descripcion:'Do Me Sol Do Sol Me Do' } },
  dominant7_arpeggio:    { pt:{ nombre:'Arpejo de dominante (7ª)', descripcion:'Do Mi Sol Sib Do' },       en:{ nombre:'Dominant 7th arpeggio', descripcion:'Do Mi Sol Te Do' } },
  diminished_arpeggio:   { pt:{ nombre:'Arpejo diminuto', descripcion:'Do Mib Solb Do' },                  en:{ nombre:'Diminished arpeggio', descripcion:'Do Me Se Do' } },

  tech_mum:              { pt:{ nombre:'Mum', descripcion:'Ressonância com consoante nasal fechada' },            en:{ nombre:'Mum', descripcion:'Resonance with a closed nasal consonant' } },
  tech_nay:              { pt:{ nombre:'Ney (Nay)', descripcion:'Colocação frontal, som brilhante' },             en:{ nombre:'Ney (Nay)', descripcion:'Forward placement, bright sound' } },
  tech_lip_trill:        { pt:{ nombre:'Lip Trill (vibração de lábios)', descripcion:'Relaxa a laringe, portamento contínuo' }, en:{ nombre:'Lip Trill', descripcion:'Relaxes the larynx, continuous portamento' } },
  tech_siren:            { pt:{ nombre:'Siren (Ng)', descripcion:'Desliza suavemente por toda a sua extensão confortável' },   en:{ nombre:'Siren (Ng)', descripcion:'Glides smoothly through your whole comfortable range' } }
};

export const PROGRESSION_I18N = {
  warmup_basico:     { pt:{ nombre:'Aquecimento básico' },          en:{ nombre:'Basic warm-up' } },
  rango_medio:       { pt:{ nombre:'Desenvolvimento da extensão média' }, en:{ nombre:'Mid-range development' } },
  tecnica_avanzada:  { pt:{ nombre:'Técnica avançada' },             en:{ nombre:'Advanced technique' } },
  flexibilidad:      { pt:{ nombre:'Flexibilidade e agilidade' },    en:{ nombre:'Flexibility and agility' } }
};

/** Devuelve {nombre, descripcion, nivel} traducidos para el idioma dado (fallback a ES). */
export function translateExercise(ex, lang){
  if(!ex) return ex;
  const tr = (EXERCISE_I18N[ex.id] || {})[lang];
  const nivel = (LEVEL_I18N[ex.nivel] || {})[lang] || ex.nivel;
  return {
    ...ex,
    nombre: (tr && tr.nombre) || ex.nombre,
    descripcion: (tr && tr.descripcion) || ex.descripcion,
    nivel
  };
}

export function translateCategoryName(catId, catNombreEs, lang){
  return (CATEGORY_I18N[catId] || {})[lang] || catNombreEs;
}

export function translateProgressionName(progId, progNombreEs, lang){
  const tr = (PROGRESSION_I18N[progId] || {})[lang];
  return (tr && tr.nombre) || progNombreEs;
}
