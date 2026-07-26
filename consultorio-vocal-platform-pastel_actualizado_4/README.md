<div align="center">

# 🎙️ Consultorio Vocal

### La suite digital gratuita y de código abierto para fonoaudiólogos de voz
### The free, open-source digital suite for voice speech-language pathologists
### O conjunto digital gratuito e open source para fonoaudiólogos de voz

**Creado por Matilde Pizarro Toro · Fonoaudióloga**

[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-4fb894?style=flat-square)](#-licencia--license--licença)
[![Sin backend](https://img.shields.io/badge/backend-cero%20servidores-5bb3e0?style=flat-square)](#-arquitectura-técnica--tech-stack--arquitetura-técnica)
[![3 idiomas](https://img.shields.io/badge/idiomas-ES%20%C2%B7%20PT%20%C2%B7%20EN-e0a5c8?style=flat-square)](#-idioma--language--idioma)
[![Accesible](https://img.shields.io/badge/accesibilidad-lector%20por%20voz-9b8bd4?style=flat-square)](#-accesibilidad--accessibility--acessibilidade)
[![PWA offline](https://img.shields.io/badge/PWA-funciona%20sin%20internet-f5b98a?style=flat-square)](#-arquitectura-técnica--tech-stack--arquitetura-técnica)

**[🇪🇸 Español](#-español)** · **[🇧🇷 Português](#-português)** · **[🇬🇧 English](#-english)**

</div>

---

## 🇪🇸 Español

### Tu consultorio de fonoaudiología vocal, en una pestaña del navegador

¿Cuántas veces armaste una rutina de ejercicios vocales a mano, cronómetro en una
ventana y planilla en otra? ¿Cuántas veces quisiste **medir** el rango vocal de tu
paciente, su vibrato, su esfuerzo fonatorio o su afinación, y terminaste haciendo
cálculos a ojo? **Consultorio Vocal** es una plataforma clínica completa —seis
herramientas profesionales bajo un mismo portal— pensada por una fonoaudióloga,
para fonoaudiólogos, para que tu tiempo de sesión sea para tu paciente y no para
pelear con planillas.

Es **gratis**, es **de código abierto**, no necesita instalación, no pide una
tarjeta de crédito, no manda tus datos a ningún servidor, y la publicás en internet
en menos de cinco minutos con GitHub Pages.

> 💗 *No es un mockup ni una demo. Es la herramienta que Matilde Pizarro Toro usa
> en su propio consultorio, ahora disponible para toda la comunidad
> fonoaudiológica hispanohablante, lusófona y anglófona.*

### 🧰 Las 6 herramientas

| Herramienta | Qué resuelve en tu día a día clínico |
|---|---|
| 🎵 **Ejercicios Vocales** | Entrenador vocal con escalas, arpegios y glissandos guiados por sintetizador de audio, detección de tu rango vocal cantando (clasifica automáticamente entre bajo, barítono, tenor, contralto, mezzosoprano y soprano), grabación y evaluación de afinación nota por nota, análisis de vibrato, afinador en tiempo real y rutinas personalizadas. Funciona **sin conexión** como app instalable (PWA). |
| 📊 **Plataforma de Análisis Acústico** | Tu Praat de bolsillo en el navegador: sube o graba audio y obtené F0, jitter, shimmer, HNR y espectrograma al instante, sin instalar software ni depender de un laboratorio. |
| 📋 **Bitácora de Sesiones** | Registro clínico de cada sesión —foco de trabajo, ejercicios realizados, sensaciones del paciente, notas clínicas, nivel y nota detectados— con exportación a PDF prolijo y con membrete, listo para la ficha del paciente. |
| ☀️ **Sesión Diaria** | Acompañamiento vocal afirmativo día a día, para pacientes que necesitan práctica constante y guiada entre sesiones presenciales. |
| 💪 **Medición del Esfuerzo Vocal** | Cuantificá el esfuerzo fonatorio de tu paciente con métricas objetivas, útil para seguimiento de disfonías y fatiga vocal. |
| 🌬️ **Respira Cuadrada** | Temporizador visual de respiración cuadrada (4-4-4-4) para trabajar el soporte respiratorio antes o durante la sesión. |

Cada herramienta funciona **de forma completamente independiente** —podés
compartir el link de una sola, por ejemplo para que tu paciente practique en
casa— y también integrada en el portal principal.

### ✨ Por qué esta plataforma es distinta

- 🌍 **Trilingüe de verdad, no traducción automática**: español, portugués y
  inglés cuidadosamente revisados, con terminología clínica correcta en cada
  idioma. Pensada desde el día uno para fonoaudiólogos de toda Latinoamérica,
  Brasil, España y el mundo angloparlante — cambiás de idioma con un clic y toda
  la interfaz, incluidos los mensajes dinámicos, responde al instante.
- ♿ **Accesibilidad real**: lector de pantalla por voz integrado — cualquier
  persona puede activar un modo en el que, con solo pasar el mouse o moverse con
  Tab por la pantalla, escucha en voz alta cada botón, campo y texto. Pensado
  para pacientes y colegas con baja visión o dificultades de lectura.
- 🎨 **5 temas de color pastel** para que la interfaz se sienta cálida y propia
  del consultorio, no clínica y fría.
- 📴 **Funciona sin internet**: Ejercicios Vocales es una PWA instalable que
  guarda todo localmente (IndexedDB) y sigue funcionando sin conexión una vez
  cargada.
- 🔒 **Privacidad primero**: no hay backend, no hay base de datos en la nube, no
  hay analytics de terceros rastreando a tus pacientes. Todo vive en el
  navegador de quien lo usa.
- 💸 **100% gratis, hoy y siempre**: sin planes pagos, sin límites de uso, sin
  letra chica. Es software libre, para que la tecnología no sea una barrera
  para ejercer la fonoaudiología con las mejores herramientas.

### 🚀 Publicalo en 5 minutos con GitHub Pages

1. Creá un repositorio nuevo en GitHub y subí **todo el contenido de esta
   carpeta** (los archivos y subcarpetas de adentro, no la carpeta contenedora).
2. Andá a **Settings → Pages → Source**, elegí la rama `main` y la carpeta
   `/ (root)`.
3. Guardá. GitHub te va a dar una URL como
   `https://tu-usuario.github.io/tu-repo/` — ese es tu portal, ya público y
   listo para compartir con tus pacientes.
4. El archivo `.nojekyll` ya está incluido para que GitHub Pages sirva todos
   los archivos (incluidos los de `assets/`) sin que el procesador Jekyll los
   ignore o transforme.

No hace falta build, backend, base de datos ni configuración adicional: es
HTML, CSS y JavaScript estático, funciona en cualquier hosting estático
(GitHub Pages, Netlify, Vercel, un servidor propio) o incluso abriendo el
`index.html` directamente en el navegador.

### 🗂️ Estructura del repositorio

```
/
├── index.html                  ← portal principal (elige herramienta)
├── assets/                     ← motor compartido: idiomas, temas, accesibilidad
│   ├── i18n-engine.js
│   ├── theme-switcher.js
│   ├── a11y-reader.js
│   └── shared.css / shared.js
├── vocalizador/                 ← Ejercicios Vocales (entrenador vocal, PWA offline)
├── praat-web/                   ← Plataforma de Análisis Acústico de la Voz
├── bitacora-sesiones/            ← Bitácora de sesiones clínicas
├── sesion-diaria/                ← Sesión diaria / acompañamiento vocal
├── esfuerzo-vocal/                ← Medición del esfuerzo vocal
└── respiracion-cuadrada/          ← Respira Cuadrada (temporizador de respiración)
```

Cada carpeta funciona también de forma independiente si se abre directamente
(por ejemplo `tu-usuario.github.io/tu-repo/vocalizador/`).

### 🧑‍⚕️ Ideal para

- Fonoaudiólogos/as clínicos que trabajan con voz cantada y hablada.
- Consultorios que quieren dar a sus pacientes una herramienta de práctica
  entre sesiones, sin costo extra.
- Docentes y estudiantes de fonoaudiología que necesitan una plataforma
  didáctica de análisis acústico.
- Cualquier profesional que quiera una alternativa gratuita y sin fricciones a
  software de escritorio pago para análisis de voz.

### 🛠️ Arquitectura técnica / tech stack

- **100% estático**: HTML5, CSS3 y JavaScript vanilla (sin frameworks pesados,
  sin build step).
- **Sin colisión de datos entre apps**: cada herramienta usa `localStorage`
  con claves con prefijo propio (`chain_mode_v1`, `afimart_panel_state`,
  `rf_presets`, etc.) y Ejercicios Vocales usa su propia base IndexedDB
  (`vocalizer2026`). Todas viven bajo el mismo dominio de GitHub Pages pero
  no comparten claves entre sí.
- **Rutas 100% relativas**: el sitio funciona igual en local, en una
  subcarpeta de GitHub Pages o en un dominio propio.
- **Service Worker con scope acotado**: el de Ejercicios Vocales controla solo
  su propia carpeta y no interfiere con el resto del portal.
- **Dependencias externas mínimas**: Google Fonts y, solo para exportar
  PDF/ZIP en algunas herramientas, `jspdf` y `jszip` desde CDN (requieren
  conexión la primera vez que se usan esas funciones puntuales; el resto de
  cada app funciona sin conexión).

### 🤝 Contribuir

¿Sos fonoaudiólogo/a, desarrollador/a o ambas cosas y querés sumar una
herramienta, corregir algo o traducir a otro idioma? Los *pull requests* son
bienvenidos. Abrí un *issue* primero si querés proponer un cambio grande.

### 📜 Licencia / License / Licença

Este proyecto se publica bajo licencia **MIT**: podés usarlo, copiarlo,
modificarlo y distribuirlo libremente, incluso con fines comerciales, siempre
manteniendo el aviso de copyright y autoría original.

### 👩‍⚕️ Autoría

Todas las herramientas fueron creadas originalmente por **Matilde Pizarro
Toro**, Fonoaudióloga. Este repositorio organiza y presenta ese trabajo para
que llegue a más colegas y pacientes en todo el mundo.

<div align="right">

[⬆️ Volver arriba](#-consultorio-vocal)

</div>

---

## 🇧🇷 Português

### Seu consultório de fonoaudiologia vocal, em uma aba do navegador

Quantas vezes você montou uma rotina de exercícios vocais na mão, cronômetro
em uma janela e planilha em outra? Quantas vezes quis **medir** a extensão
vocal do seu paciente, o vibrato, o esforço fonatório ou a afinação, e acabou
fazendo cálculos no olho? **Consultorio Vocal** é uma plataforma clínica
completa — seis ferramentas profissionais em um único portal — pensada por
uma fonoaudióloga, para fonoaudiólogos, para que seu tempo de sessão seja
para o seu paciente, e não para brigar com planilhas.

É **gratuito**, é **de código aberto**, não precisa de instalação, não pede
cartão de crédito, não envia seus dados para nenhum servidor, e você publica
na internet em menos de cinco minutos com o GitHub Pages.

> 💗 *Não é um mockup nem uma demo. É a ferramenta que Matilde Pizarro Toro
> usa no próprio consultório, agora disponível para toda a comunidade
> fonoaudiológica de língua portuguesa, espanhola e inglesa.*

### 🧰 As 6 ferramentas

| Ferramenta | O que resolve no seu dia a dia clínico |
|---|---|
| 🎵 **Exercícios Vocais** | Treinador vocal com escalas, arpejos e glissandos guiados por sintetizador de áudio, detecção da extensão vocal cantando (classifica automaticamente entre baixo, barítono, tenor, contralto, mezzosoprano e soprano), gravação e avaliação de afinação nota por nota, análise de vibrato, afinador em tempo real e rotinas personalizadas. Funciona **sem conexão** como app instalável (PWA). |
| 📊 **Plataforma de Análise Acústica** | Seu Praat de bolso no navegador: envie ou grave áudio e obtenha F0, jitter, shimmer, HNR e espectrograma na hora, sem instalar software nem depender de um laboratório. |
| 📋 **Diário de Sessões** | Registro clínico de cada sessão — foco de trabalho, exercícios realizados, sensações do paciente, notas clínicas, nível e nota detectados — com exportação em PDF organizado e com timbre, pronto para o prontuário. |
| ☀️ **Sessão Diária** | Acompanhamento vocal afirmativo dia a dia, para pacientes que precisam de prática constante e guiada entre sessões presenciais. |
| 💪 **Medição do Esforço Vocal** | Quantifique o esforço fonatório do seu paciente com métricas objetivas, útil para acompanhamento de disfonias e fadiga vocal. |
| 🌬️ **Respiração Quadrada** | Temporizador visual de respiração quadrada (4-4-4-4) para trabalhar o suporte respiratório antes ou durante a sessão. |

Cada ferramenta funciona **de forma totalmente independiente** — você pode
compartilhar o link de apenas uma, por exemplo para o paciente praticar em
casa — e também integrada no portal principal.

### ✨ Por que esta plataforma é diferente

- 🌍 **Trilíngue de verdade, não tradução automática**: espanhol, português e
  inglês cuidadosamente revisados, com terminologia clínica correta em cada
  idioma. Pensada desde o início para fonoaudiólogos de toda a América Latina,
  Brasil, Espanha e do mundo anglófono — você troca de idioma com um clique e
  toda a interface, incluindo as mensagens dinâmicas, responde na hora.
- ♿ **Acessibilidade real**: leitor de tela por voz integrado — qualquer
  pessoa pode ativar um modo em que, apenas passando o mouse ou navegando com
  Tab pela tela, ouve em voz alta cada botão, campo e texto. Pensado para
  pacientes e colegas com baixa visão ou dificuldades de leitura.
- 🎨 **5 temas de cor pastel** para que a interface seja acolhedora e com
  identidade própria do consultório, não clínica e fria.
- 📴 **Funciona sem internet**: Exercícios Vocais é um PWA instalável que
  guarda tudo localmente (IndexedDB) e continua funcionando sem conexão depois
  de carregado.
- 🔒 **Privacidade em primeiro lugar**: não há backend, não há banco de dados
  na nuvem, não há analytics de terceiros rastreando seus pacientes. Tudo vive
  no navegador de quem usa.
- 💸 **100% gratuito, hoje e sempre**: sem planos pagos, sem limites de uso,
  sem letras miúdas. É software livre, para que a tecnologia não seja uma
  barreira para exercer a fonoaudiologia com as melhores ferramentas.

### 🚀 Publique em 5 minutos com GitHub Pages

1. Crie um repositório novo no GitHub e envie **todo o conteúdo desta pasta**
   (os arquivos e subpastas de dentro, não a pasta que os contém).
2. Vá em **Settings → Pages → Source**, escolha a branch `main` e a pasta
   `/ (root)`.
3. Salve. O GitHub vai gerar uma URL como
   `https://seu-usuario.github.io/seu-repo/` — esse é o seu portal, já público
   e pronto para compartilhar com seus pacientes.
4. O arquivo `.nojekyll` já está incluído para que o GitHub Pages sirva todos
   os arquivos (inclusive os de `assets/`) sem que o processador Jekyll os
   ignore ou transforme.

Não precisa de build, backend, banco de dados nem configuração adicional: é
HTML, CSS e JavaScript estático, funciona em qualquer hospedagem estática
(GitHub Pages, Netlify, Vercel, servidor próprio) ou até abrindo o
`index.html` diretamente no navegador.

### 🗂️ Estrutura do repositório

```
/
├── index.html                  ← portal principal (escolha da ferramenta)
├── assets/                     ← motor compartilhado: idiomas, temas, acessibilidade
│   ├── i18n-engine.js
│   ├── theme-switcher.js
│   ├── a11y-reader.js
│   └── shared.css / shared.js
├── vocalizador/                 ← Exercícios Vocais (treinador vocal, PWA offline)
├── praat-web/                   ← Plataforma de Análise Acústica da Voz
├── bitacora-sesiones/            ← Diário de sessões clínicas
├── sesion-diaria/                ← Sessão diária / acompanhamento vocal
├── esfuerzo-vocal/                ← Medição do esforço vocal
└── respiracion-cuadrada/          ← Respiração Quadrada (temporizador de respiração)
```

Cada pasta também funciona de forma independente se aberta diretamente
(por exemplo `seu-usuario.github.io/seu-repo/vocalizador/`).

### 🧑‍⚕️ Ideal para

- Fonoaudiólogos/as clínicos que trabalham com voz cantada e falada.
- Consultórios que querem oferecer aos pacientes uma ferramenta de prática
  entre sessões, sem custo extra.
- Professores e estudantes de fonoaudiologia que precisam de uma plataforma
  didática de análise acústica.
- Qualquer profissional que queira uma alternativa gratuita e sem atrito a
  softwares de desktop pagos para análise de voz.

### 🛠️ Arquitetura técnica

- **100% estático**: HTML5, CSS3 e JavaScript puro (sem frameworks pesados,
  sem etapa de build).
- **Sem colisão de dados entre apps**: cada ferramenta usa `localStorage` com
  chaves com prefixo próprio (`chain_mode_v1`, `afimart_panel_state`,
  `rf_presets`, etc.) e Exercícios Vocais usa seu próprio banco IndexedDB
  (`vocalizer2026`). Todas vivem sob o mesmo domínio do GitHub Pages, mas não
  compartilham chaves entre si.
- **Caminhos 100% relativos**: o site funciona igual localmente, em uma
  subpasta do GitHub Pages ou em domínio próprio.
- **Service Worker com escopo limitado**: o de Exercícios Vocais controla
  apenas sua própria pasta e não interfere no resto do portal.
- **Dependências externas mínimas**: Google Fonts e, apenas para exportar
  PDF/ZIP em algumas ferramentas, `jspdf` e `jszip` via CDN (exigem conexão na
  primeira vez que essas funções pontuais são usadas; o resto de cada app
  funciona sem conexão).

### 🤝 Contribuir

É fonoaudiólogo/a, desenvolvedor/a ou as duas coisas e quer adicionar uma
ferramenta, corrigir algo ou traduzir para outro idioma? *Pull requests* são
bem-vindos. Abra uma *issue* primeiro se quiser propor uma mudança grande.

### 👩‍⚕️ Autoria

Todas as ferramentas foram criadas originalmente por **Matilde Pizarro
Toro**, Fonoaudióloga. Este repositório organiza e apresenta esse trabalho
para que chegue a mais colegas e pacientes no mundo todo.

<div align="right">

[⬆️ Voltar ao topo](#-consultorio-vocal)

</div>

---

## 🇬🇧 English

### Your voice-therapy practice, in one browser tab

How many times have you built a vocal-exercise routine by hand, a stopwatch in
one window and a spreadsheet in another? How many times did you want to
**measure** a patient's vocal range, their vibrato, their phonatory effort or
their pitch accuracy, and ended up eyeballing it? **Consultorio Vocal** is a
complete clinical platform — six professional tools under one portal —
designed by a speech-language pathologist, for speech-language pathologists,
so your session time goes to your patient instead of fighting spreadsheets.

It's **free**, it's **open source**, it needs no installation, asks for no
credit card, sends none of your data to any server, and you can publish it on
the web in under five minutes with GitHub Pages.

> 💗 *This isn't a mockup or a demo. It's the actual tool Matilde Pizarro Toro
> uses in her own practice, now available to the whole
> speech-language-pathology community — Spanish-, Portuguese- and
> English-speaking alike.*

### 🧰 The 6 tools

| Tool | What it solves in your clinical day-to-day |
|---|---|
| 🎵 **Vocal Exercises** | A vocal trainer with scales, arpeggios and glissandos guided by a built-in audio synthesizer, sung vocal-range detection (automatically classifies bass, baritone, tenor, alto, mezzo-soprano and soprano), note-by-note pitch-accuracy recording and evaluation, vibrato analysis, a real-time tuner, and custom routines. Works **fully offline** as an installable PWA. |
| 📊 **Acoustic Analysis Platform** | A pocket Praat in your browser: upload or record audio and get F0, jitter, shimmer, HNR and a spectrogram instantly — no software install, no lab dependency. |
| 📋 **Session Log** | A clinical record for every session — focus of work, exercises performed, patient sensations, clinical notes, detected level and pitch — exportable as a clean, letterhead-branded PDF, ready for the patient's chart. |
| ☀️ **Daily Session** | Day-to-day affirming vocal coaching for patients who need consistent, guided practice between in-person sessions. |
| 💪 **Vocal Effort Measurement** | Quantify your patient's phonatory effort with objective metrics — useful for tracking dysphonia and vocal fatigue over time. |
| 🌬️ **Square Breathing** | A visual square-breathing (4-4-4-4) timer to work on breath support before or during a session. |

Every tool works **fully standalone** — you can share the link to just one,
for example so a patient can practice at home — and also fully integrated
into the main portal.

### ✨ Why this platform is different

- 🌍 **Genuinely trilingual, not machine-translated**: Spanish, Portuguese and
  English, carefully reviewed with correct clinical terminology in each
  language. Built from day one for speech-language pathologists across Latin
  America, Brazil, Spain and the English-speaking world — switch languages
  with one click and the entire interface, including dynamic messages,
  updates instantly.
- ♿ **Real accessibility**: a built-in voice screen-reader mode — anyone can
  turn on a mode where simply hovering the mouse or tabbing through the page
  reads every button, field and piece of text out loud. Built for patients
  and colleagues with low vision or reading difficulties.
- 🎨 **5 pastel color themes** so the interface feels warm and like *your*
  practice, not cold and clinical.
- 📴 **Works offline**: Vocal Exercises is an installable PWA that stores
  everything locally (IndexedDB) and keeps working without a connection once
  it's loaded.
- 🔒 **Privacy first**: no backend, no cloud database, no third-party
  analytics tracking your patients. Everything lives in the browser of
  whoever is using it.
- 💸 **100% free, today and always**: no paid tiers, no usage limits, no fine
  print. It's free software, so technology is never a barrier to practicing
  speech-language pathology with the best tools available.

### 🚀 Publish it in 5 minutes with GitHub Pages

1. Create a new GitHub repository and upload **the entire contents of this
   folder** (the files and subfolders inside it, not the containing folder
   itself).
2. Go to **Settings → Pages → Source**, choose the `main` branch and the
   `/ (root)` folder.
3. Save. GitHub will give you a URL like
   `https://your-username.github.io/your-repo/` — that's your portal, live
   and ready to share with your patients.
4. The `.nojekyll` file is already included so GitHub Pages serves every file
   (including the ones in `assets/`) without the Jekyll processor ignoring or
   transforming them.

No build step, backend, database or extra configuration required: it's
static HTML, CSS and JavaScript, so it works on any static host (GitHub
Pages, Netlify, Vercel, your own server) or even by opening `index.html`
directly in a browser.

### 🗂️ Repository structure

```
/
├── index.html                  ← main portal (pick a tool)
├── assets/                     ← shared engine: languages, themes, accessibility
│   ├── i18n-engine.js
│   ├── theme-switcher.js
│   ├── a11y-reader.js
│   └── shared.css / shared.js
├── vocalizador/                 ← Vocal Exercises (vocal trainer, offline PWA)
├── praat-web/                   ← Acoustic Voice Analysis Platform
├── bitacora-sesiones/            ← Clinical session log
├── sesion-diaria/                ← Daily session / vocal coaching
├── esfuerzo-vocal/                ← Vocal effort measurement
└── respiracion-cuadrada/          ← Square Breathing (breathing timer)
```

Each folder also works independently if opened directly (e.g.
`your-username.github.io/your-repo/vocalizador/`).

### 🧑‍⚕️ Ideal for

- Clinical speech-language pathologists working with sung and spoken voice.
- Practices that want to give patients a home-practice tool at no extra cost.
- Speech-language-pathology teachers and students who need a hands-on
  acoustic-analysis platform.
- Any professional wanting a free, frictionless alternative to paid desktop
  voice-analysis software.

### 🛠️ Tech stack

- **100% static**: HTML5, CSS3 and vanilla JavaScript (no heavy frameworks,
  no build step).
- **No cross-app data collisions**: each tool uses `localStorage` with its
  own key prefix (`chain_mode_v1`, `afimart_panel_state`, `rf_presets`, etc.),
  and Vocal Exercises uses its own IndexedDB database (`vocalizer2026`). They
  all live under the same GitHub Pages domain but never share keys with each
  other.
- **Fully relative paths**: the site works the same locally, in a GitHub
  Pages subfolder, or on a custom domain.
- **Scoped service worker**: Vocal Exercises' service worker only controls
  its own folder and doesn't interfere with the rest of the portal.
- **Minimal external dependencies**: Google Fonts, and, only for PDF/ZIP
  export in some tools, `jspdf` and `jszip` from a CDN (these require an
  internet connection the first time those specific features are used; the
  rest of every app works offline).

### 🤝 Contributing

Are you a speech-language pathologist, a developer, or both, and want to add
a tool, fix something, or translate into another language? Pull requests are
welcome. Please open an issue first for larger changes.

### 👩‍⚕️ Credits

Every tool was originally created by **Matilde Pizarro Toro**,
Speech-Language Pathologist. This repository organizes and presents that
work so it can reach more colleagues and patients worldwide.

<div align="right">

[⬆️ Back to top](#-consultorio-vocal)

</div>

---

<div align="center">

Hecho con 💗 para la fonoaudiología del mundo entero.
Feito com 💗 para a fonoaudiologia do mundo inteiro.
Made with 💗 for speech-language pathology worldwide.

</div>
