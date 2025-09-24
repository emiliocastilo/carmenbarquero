// animacion-sobre-mi.js
// Animación de aparición para el texto de la sección "Sobre mí"

function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function mostrarTextoSobreMiScroll() {
  var texto = document.querySelector('.sobre-mi-texto-contenido');
  if (!texto) return;
  if (isMobile()) {
    if (window.scrollY >= 400) {
      texto.classList.add('visible');
    } else {
      texto.classList.remove('visible');
    }
  } else {
    texto.classList.add('visible');
  }
}

document.addEventListener('DOMContentLoaded', mostrarTextoSobreMiScroll);
window.addEventListener('resize', mostrarTextoSobreMiScroll);
window.addEventListener('scroll', mostrarTextoSobreMiScroll);
