// pasos-clinica.js
// Animación para rellenar las bolitas de los pasos

document.addEventListener('DOMContentLoaded', function() {
  var circulos = document.querySelectorAll('.paso-circulo');
  circulos.forEach(function(circulo, i) {
    var fill = document.createElement('div');
    fill.className = 'paso-circulo-fill';
    circulo.appendChild(fill);
  });

  function animarPasos() {
    var fills = document.querySelectorAll('.paso-circulo-fill');
    fills.forEach(function(fill, idx) {
      setTimeout(function() {
        fill.style.width = '100%';
      }, 600 * idx);
    });
  }

  // Lanzar animación al cargar
  animarPasos();
});
