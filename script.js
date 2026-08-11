/* ============================================================
   MIS XV AÑOS · ELUNEY
   ------------------------------------------------------------
   >>> EDITÁ SOLO ESTE BLOQUE PARA PERSONALIZAR LA TARJETA <<<
============================================================ */
const CONFIG = {
  nombre: 'Eluney',

  // Fecha y hora del evento (año, mes-1, día, hora, minuto)
  // Noviembre = mes 10 porque en JS los meses van de 0 a 11.
  fecha: new Date(2026, 10, 20, 21, 30, 0),

  salon:     'Salón Janos Temperley',
  direccion: 'Avenida 9 de Julio 802, Temperley',

  // Número de WhatsApp para confirmar asistencia.
  // Formato internacional SIN "+" ni espacios. Ej: '5491123456789'
  // Dejalo vacío ('') si todavía no lo tenés.
  whatsapp: '',

  duracionHoras: 6,          // duración estimada (para "Agendar el día")
  zonaHoraria: 'America/Argentina/Buenos_Aires',

  // Cuánto dura cada frase del video, en milisegundos.
  // Más alto = frases más lentas. (6800 ms ≈ 6,8 segundos cada una)
  duracionFrase: 6800
};

/* ============================================================
   Atajos
============================================================ */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const portada  = $('#portada');
const intro    = $('#intro');
const video    = $('#intro-video');
const card     = $('#card');
const audio    = $('#audio');
const btnMusic = $('#btn-music');

let musicaActiva = false;
let introFinalizada = false;

/* ============================================================
   1 · PORTADA  →  entrada
============================================================ */
$('#btn-con-musica').addEventListener('click', () => entrar(true));
$('#btn-sin-musica').addEventListener('click', () => entrar(false));

function entrar(conMusica) {
  musicaActiva = conMusica;

  if (conMusica) {
    audio.volume = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(() => { musicaActiva = false; refrescarBotonMusica(); });
    subirVolumen(0.55, 2500);   // fade-in suave
  }

  portada.classList.add('is-out');
  setTimeout(() => { portada.style.display = 'none'; }, 950);

  reproducirIntro();
}

/* Fade-in del volumen */
function subirVolumen(destino, ms) {
  const pasos = 40, dt = ms / pasos;
  let i = 0;
  const id = setInterval(() => {
    i++;
    audio.volume = Math.min(destino, (destino * i) / pasos);
    if (i >= pasos) clearInterval(id);
  }, dt);
}

/* ============================================================
   2 · INTRO EN VIDEO + FRASES
============================================================ */
const frases = $$('[data-line]');
let fraseActual = -1;
let temporizadorFrases = null;

function reproducirIntro() {
  intro.classList.add('is-in');
  intro.setAttribute('aria-hidden', 'false');

  video.muted = true;                       // la banda sonora es la canción
  const p = video.play();
  if (p && p.catch) p.catch(() => {});       // si el video no puede reproducirse, las frases avanzan igual

  iniciarFrases();
}

/* Las frases avanzan solas, al ritmo de CONFIG.duracionFrase */
function iniciarFrases() {
  if (temporizadorFrases) return;
  let i = 0;
  mostrarFrase(0);
  temporizadorFrases = setInterval(() => {
    i++;
    if (i >= frases.length) { clearInterval(temporizadorFrases); mostrarTarjeta(); return; }
    mostrarFrase(i);
  }, CONFIG.duracionFrase);
}

function mostrarFrase(idx) {
  if (idx === fraseActual) return;
  fraseActual = idx;
  frases.forEach((f, i) => f.classList.toggle('is-on', i === idx));
}

/* ============================================================
   3 · TARJETA
============================================================ */
function mostrarTarjeta() {
  if (introFinalizada) return;
  introFinalizada = true;

  if (temporizadorFrases) clearInterval(temporizadorFrases);

  intro.classList.add('is-out');
  intro.setAttribute('aria-hidden', 'true');

  setTimeout(() => {
    try { video.pause(); } catch (e) {}
    intro.style.display = 'none';

    card.classList.add('is-on');
    card.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('is-locked');
    window.scrollTo(0, 0);

    btnMusic.hidden = false;
    refrescarBotonMusica();

    crearParticulas();
    activarReveals();
  }, 1100);
}

/* ============================================================
   CUENTA REGRESIVA
============================================================ */
const cdD = $('#cd-d'), cdH = $('#cd-h'), cdM = $('#cd-m'), cdS = $('#cd-s'), cdMsg = $('#cd-msg');

function actualizarCuenta() {
  const restante = CONFIG.fecha - new Date();

  if (restante <= 0) {
    [cdD, cdH, cdM, cdS].forEach(el => el.textContent = '00');
    cdMsg.textContent = '¡Hoy es el gran día!';
    clearInterval(intervaloCuenta);
    return;
  }

  const seg = Math.floor(restante / 1000);
  const dias  = Math.floor(seg / 86400);
  const horas = Math.floor((seg % 86400) / 3600);
  const min   = Math.floor((seg % 3600) / 60);
  const s     = seg % 60;

  cdD.textContent = String(dias).padStart(2, '0');
  cdH.textContent = String(horas).padStart(2, '0');
  cdM.textContent = String(min).padStart(2, '0');
  cdS.textContent = String(s).padStart(2, '0');
}

const intervaloCuenta = setInterval(actualizarCuenta, 1000);
actualizarCuenta();

/* ============================================================
   ENLACES (mapa, calendario, WhatsApp)
============================================================ */
const destino = `${CONFIG.salon}, ${CONFIG.direccion}`;
$('#btn-mapa').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(destino);

(function armarCalendario() {
  const fmt = (d) =>
    String(d.getFullYear()) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') + 'T' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') + '00';

  const fin = new Date(CONFIG.fecha.getTime() + CONFIG.duracionHoras * 3600 * 1000);
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', `Mis XV Años · ${CONFIG.nombre}`);
  url.searchParams.set('dates', `${fmt(CONFIG.fecha)}/${fmt(fin)}`);
  url.searchParams.set('location', destino);
  url.searchParams.set('details', `¡Te espero para celebrar mis XV años! — ${CONFIG.nombre}`);
  url.searchParams.set('ctz', CONFIG.zonaHoraria);
  $('#btn-agenda').href = url.toString();
})();

(function armarWhatsApp() {
  const btn  = $('#btn-wa');
  const nota = $('#wa-note');

  if (!CONFIG.whatsapp) {
    btn.href = '#';
    btn.addEventListener('click', (e) => { e.preventDefault(); nota.hidden = false; });
    return;
  }
  const texto = `¡Hola! Confirmo mi asistencia a los XV de ${CONFIG.nombre} 💫`;
  btn.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
})();

/* ============================================================
   COPIAR ALIAS
============================================================ */
$('#btn-copy').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const valor = $('#alias-val').textContent.trim();
  try {
    await navigator.clipboard.writeText(valor);
  } catch (err) {
    const tmp = document.createElement('textarea');
    tmp.value = valor;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    tmp.remove();
  }
  const original = btn.textContent;
  btn.textContent = '¡Copiado!';
  setTimeout(() => { btn.textContent = original; }, 1800);
});

/* ============================================================
   CONTROL DE MÚSICA
============================================================ */
btnMusic.addEventListener('click', () => {
  if (audio.paused) {
    audio.volume = 0;
    audio.play().then(() => subirVolumen(0.55, 1200)).catch(() => {});
    musicaActiva = true;
  } else {
    audio.pause();
    musicaActiva = false;
  }
  refrescarBotonMusica();
});

function refrescarBotonMusica() {
  const sonando = musicaActiva && !audio.paused;
  btnMusic.classList.toggle('is-on', sonando);
  btnMusic.classList.toggle('is-off', !sonando);
  btnMusic.setAttribute('aria-label', sonando ? 'Pausar música' : 'Reproducir música');
}

audio.addEventListener('play',  refrescarBotonMusica);
audio.addEventListener('pause', refrescarBotonMusica);

/* ============================================================
   BRILLOS DORADOS FLOTANTES
============================================================ */
function crearBrillos(contenedor) {
  if (!contenedor || contenedor.childElementCount) return;

  const cantidad = window.innerWidth < 640 ? 16 : 26;
  for (let i = 0; i < cantidad; i++) {
    const b = document.createElement('span');
    b.className = 'brillo';
    const tam = 2 + Math.random() * 5;
    b.style.width  = tam + 'px';
    b.style.height = tam + 'px';
    b.style.left = Math.random() * 100 + '%';
    b.style.setProperty('--dx', (Math.random() * 90 - 45) + 'px');
    // dos duraciones: la primera para "flotar", la segunda para "titilar"
    b.style.animationDuration = `${14 + Math.random() * 16}s, ${2.5 + Math.random() * 3.5}s`;
    b.style.animationDelay = `${-Math.random() * 24}s, ${-Math.random() * 6}s`;
    contenedor.appendChild(b);
  }
}

/* Los de la portada y el intro arrancan enseguida; los de la tarjeta, al mostrarla */
crearBrillos($('#brillos-portada'));
crearBrillos($('#brillos-intro'));

function crearParticulas() {
  crearBrillos($('#brillos-hero'));
  crearBrillos($('#brillos-cierre'));
}

/* ============================================================
   GALERÍA DE RECUERDOS · una foto por vez
============================================================ */
(function galeria() {
  const pista  = $('#galeria-pista');
  const puntos = $('#galeria-puntos');
  if (!pista) return;

  const slides = Array.from(pista.children);
  let actual = 0;

  slides.forEach((_, i) => {
    const p = document.createElement('button');
    p.type = 'button';
    p.className = 'galeria__punto';
    p.setAttribute('aria-label', `Ver foto ${i + 1} de ${slides.length}`);
    p.addEventListener('click', () => ir(i));
    puntos.appendChild(p);
  });

  function ir(i) {
    actual = (i + slides.length) % slides.length;   // da la vuelta en los extremos
    pista.style.transform = `translateX(-${actual * 100}%)`;
    Array.from(puntos.children).forEach((p, n) => p.classList.toggle('is-on', n === actual));
  }

  $('#galeria-prev').addEventListener('click', () => ir(actual - 1));
  $('#galeria-next').addEventListener('click', () => ir(actual + 1));

  /* Deslizar con el dedo */
  let x0 = null;
  pista.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  pista.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 40) ir(actual + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  pista.addEventListener('pointercancel', () => { x0 = null; });

  ir(0);
})();

/* ============================================================
   APARICIÓN AL SCROLL
============================================================ */
function activarReveals() {
  const items = $$('.reveal');

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => obs.observe(el));
}

/* ============================================================
   PAUSAR LA MÚSICA SI SE OCULTA LA PESTAÑA
============================================================ */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !audio.paused) {
    audio.pause();
  } else if (!document.hidden && musicaActiva && audio.paused && introFinalizada) {
    audio.play().catch(() => {});
  }
});
