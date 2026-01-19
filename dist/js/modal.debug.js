// modal.js
// Lógica para mostrar y ocultar el modal de éxito

document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("modal-exito");
  var btnCerrar = modal ? modal.querySelector(".cerrar-modal") : null;

  window.mostrarModalExito = function () {
    if (modal) {
      modal.classList.add("visible");
    }
  };

  if (btnCerrar) {
    btnCerrar.addEventListener("click", function () {
      modal.classList.remove("visible");
    });
  }

  // Opcional: cerrar modal al hacer click fuera del contenido
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("visible");
      }
    });
  }
});
