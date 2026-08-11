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

  // Usuario de Instagram (sin @) al que va a apuntar el botón "Ver en Instagram".
  // Dejalo vacío ('') si todavía no lo tenés.
  instagram: '',

  // Hashtag para que suban las fotos de la fiesta. Dejalo vacío ('')
  // para armarlo solo a partir del nombre, ej: "#15Eluney".
  hashtag: '',

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

/* ============================================================
   NOMBRE PERSONALIZADO DEL INVITADO
   ------------------------------------------------------------
   Se toma de la dirección web, así que NO hay que tocar el código
   para cada invitado: a cada uno le mandás el mismo link pero con
   su nombre al final.

     ...tarjeta/?invitado=Familia%20Pérez
     ...tarjeta/?invitado=Tía%20Marta

   El %20 es un espacio. Si el link lo armás desde el celular o lo
   pegás en WhatsApp, podés escribir el espacio normal y funciona
   igual. Sin ?invitado=... la tarjeta se ve como siempre.
============================================================ */
const invitado = (function leerInvitado() {
  const p = new URLSearchParams(window.location.search);
  const valor = (p.get('invitado') || p.get('nombre') || p.get('i') || '').trim();
  return valor.slice(0, 60);   // por si alguien pega cualquier cosa en la URL
})();

if (invitado) {
  const enPortada = $('#invitado-portada');
  enPortada.textContent = `Para ${invitado}`;
  enPortada.hidden = false;

  const enRsvp = $('#invitado-rsvp');
  enRsvp.textContent = `¡Te esperamos, ${invitado}!`;
  enRsvp.hidden = false;
}

/* ============================================================
   INSTAGRAM
============================================================ */
(function armarInstagram() {
  const btn  = $('#btn-instagram');
  const nota = $('#ig-note');
  const hash = $('#ig-hash');
  if (!btn) return;

  hash.textContent = '#' + (CONFIG.hashtag || `15${CONFIG.nombre}`).replace(/^#/, '');

  if (!CONFIG.instagram) {
    btn.href = '#';
    btn.addEventListener('click', (e) => { e.preventDefault(); nota.hidden = false; });
    return;
  }
  btn.href = `https://www.instagram.com/${CONFIG.instagram.replace(/^@/, '')}/`;
})();

/* ============================================================
   VENTANAS EMERGENTES (modales)
   Un solo motor para los dos formularios: confirmar y sugerir.
============================================================ */
function armarModal(selBoton, selModal, selPrimerCampo) {
  const boton = $(selBoton);
  const modal = $(selModal);
  if (!boton || !modal) return null;

  const form  = modal.querySelector('form');
  const aviso = modal.querySelector('.modal__aviso');

  function abrir() {
    modal.hidden = false;
    document.body.classList.add('is-locked');
    aviso.hidden = true;
    form.hidden = false;
    setTimeout(() => { const c = $(selPrimerCampo); if (c) c.focus(); }, 50);
  }

  function cerrar() {
    modal.hidden = true;
    document.body.classList.remove('is-locked');
  }

  function terminar(mensaje) {
    form.hidden = true;
    aviso.textContent = mensaje;
    aviso.hidden = false;
  }

  boton.addEventListener('click', abrir);
  /* ojo: sólo los "cerrar" DE ESTE modal, si no un modal cierra al otro */
  modal.querySelectorAll('[data-cerrar]').forEach(el => el.addEventListener('click', cerrar));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) cerrar();
  });

  return { form, abrir, cerrar, terminar };
}

/* Manda el mensaje por WhatsApp. Si todavía no cargaste el número
   en CONFIG.whatsapp, el formulario igual responde bien. */
function enviarPorWhatsApp(texto) {
  if (!CONFIG.whatsapp) return false;
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`,
              '_blank', 'noopener');
  return true;
}

/* ============================================================
   CONFIRMAR ASISTENCIA (modal con adultos y niños)
============================================================ */
(function modalRsvp() {
  const m = armarModal('#btn-wa', '#modal-rsvp', '#rsvp-nombre');
  if (!m) return;

  /* si el link traía ?invitado=..., el nombre ya viene escrito */
  if (invitado) $('#rsvp-nombre').value = invitado;

  /* contadores − / + */
  $$('[data-conteo]').forEach((caja) => {
    const num = caja.querySelector('[data-num]');
    const [menos, mas] = caja.querySelectorAll('.conteo__btn');

    function pintar() {
      const v = Number(num.textContent);
      menos.disabled = v <= 0;
      mas.disabled   = v >= 15;
    }

    caja.querySelectorAll('.conteo__btn').forEach((b) => {
      b.addEventListener('click', () => {
        const v = Number(num.textContent) + Number(b.dataset.paso);
        num.textContent = String(Math.min(15, Math.max(0, v)));
        pintar();
      });
    });

    pintar();
  });

  m.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre  = $('#rsvp-nombre').value.trim();
    const adultos = Number($('#rsvp-adultos').textContent);
    const ninos   = Number($('#rsvp-ninos').textContent);

    if (!nombre) { $('#rsvp-nombre').focus(); return; }
    if (adultos + ninos === 0) {
      m.terminar('Elegí al menos una persona para poder confirmar 💛');
      setTimeout(() => { m.form.hidden = false; $('#rsvp-aviso').hidden = true; }, 2200);
      return;
    }

    let texto = `💫 Confirmo mi asistencia a los XV de ${CONFIG.nombre}\n`;
    texto += `Nombre: ${nombre}\n`;
    texto += `Adultos: ${adultos}\n`;
    texto += `Niños: ${ninos}`;
    enviarPorWhatsApp(texto);

    const total = adultos + ninos;
    m.terminar(`¡Gracias ${nombre}! Quedaron confirmados ${total} lugar${total === 1 ? '' : 'es'} 💛`);
  });
})();

/* ============================================================
   SUGERIR CANCIÓN (modal)
============================================================ */
(function modalCancion() {
  const m = armarModal('#btn-sugerir', '#modal-cancion', '#cancion-nombre');
  if (!m) return;

  if (invitado) $('#cancion-nombre').value = invitado;

  m.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre  = $('#cancion-nombre').value.trim();
    const cancion = $('#cancion-tema').value.trim();
    const link    = $('#cancion-link').value.trim();
    if (!nombre)  { $('#cancion-nombre').focus(); return; }
    if (!cancion) { $('#cancion-tema').focus();   return; }

    let texto = `🎶 Sugerencia de canción para los XV de ${CONFIG.nombre}\n`;
    texto += `De: ${nombre}\n`;
    texto += `Canción: ${cancion}`;
    if (link) texto += `\nLink: ${link}`;
    enviarPorWhatsApp(texto);

    m.terminar('¡Gracias! Tu canción fue anotada para la playlist 🎧');
    m.form.reset();
  });
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

  const marco  = pista.parentElement;
  const slides = Array.from(pista.children);
  let actual = 0;

  /* El marco copia la forma de la foto activa: así la llena entera,
     sin recortarla y sin dejar bandas vacías arriba o a los costados.
     Se limita el rango para que no quede ni larguísimo ni demasiado chato. */
  function ajustarMarco() {
    const img = slides[actual].querySelector('img');
    if (!img || !img.naturalWidth) return;   // todavía no cargó
    const r = img.naturalWidth / img.naturalHeight;
    marco.style.aspectRatio = String(Math.min(1.5, Math.max(0.7, r)));
  }

  slides.forEach((s) => {
    const img = s.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', ajustarMarco, { once: true });
  });

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
    ajustarMarco();
  }

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
