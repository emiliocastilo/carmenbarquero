// animacion-sobre-mi.js
// Animación de aparición para el texto de la sección "Sobre mí"

function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches;
}
function mostrarTextoSobreMi() {
  var texto = document.querySelector('.sobre-mi-texto-contenido');
  if (!texto) return;
  if (isMobile()) {
    setTimeout(function() {
      texto.classList.add('visible');
    }, 1000);
  } else {
    texto.classList.add('visible');
  }
}
document.addEventListener('DOMContentLoaded', mostrarTextoSobreMi);
window.addEventListener('resize', function() {
  var texto = document.querySelector('.sobre-mi-texto-contenido');
  if (!texto) return;
  if (isMobile()) {
    texto.classList.remove('visible');
    setTimeout(function() {
      texto.classList.add('visible');
    }, 1000);
  } else {
    texto.classList.add('visible');
  }
});
