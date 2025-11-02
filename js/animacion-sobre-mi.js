// animacion-sobre-mi.js
// Animación de aparición para el texto de la sección "Sobre mí"

function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function mostrarTextoSobreMiScroll() {
  var texto = document.querySelector(".sobre-mi-texto-contenido");
  if (!texto) return;
  
  if (isMobile()) {
    // En móvil: activar cuando la sección esté visible
    var seccion = document.getElementById("sobre-mi");
    if (seccion) {
      var rect = seccion.getBoundingClientRect();
      var windowHeight = window.innerHeight;
      
      // Activar cuando la sección esté 30% visible
      if (rect.top < windowHeight * 0.7 && rect.bottom > windowHeight * 0.3) {
        texto.classList.add("visible");
      }
    }
  } else {
    // En desktop: mostrar inmediatamente (sin overlay)
    texto.classList.add("visible");
  }
}

// Función para manejar cambios de orientación y redimensionado
function manejarCambioTamaño() {
  var texto = document.querySelector(".sobre-mi-texto-contenido");
  if (!texto) return;
  
  // Resetear la animación
  texto.classList.remove("visible");
  
  // Aplicar después de un breve delay para que se apliquen los estilos CSS
  setTimeout(mostrarTextoSobreMiScroll, 100);
}

// Event listeners optimizados
document.addEventListener("DOMContentLoaded", mostrarTextoSobreMiScroll);
window.addEventListener("scroll", mostrarTextoSobreMiScroll, { passive: true });
window.addEventListener("resize", manejarCambioTamaño);
window.addEventListener("orientationchange", function() {
  setTimeout(manejarCambioTamaño, 300); // Delay para cambio de orientación
});
