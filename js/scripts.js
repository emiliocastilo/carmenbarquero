// scripts.js
// Mostrar el texto con animación tras 1s al llegar a la imagen en mobile
function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches;
}
function mostrarTextoSobreMi() {
  var texto = document.getElementById('sobreMiTexto');
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
  var texto = document.getElementById('sobreMiTexto');
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
