// contacto-form.js
// Envía el formulario de contacto por AJAX y muestra mensaje de éxito o error

document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector("#formulario-contacto form");
  if (!form) return;

  var btn = form ? form.querySelector('button[type="submit"]') : null;
  if (!form || !btn) return;

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    var datos = {
      nombre: form.nombre.value,
      apellidos: form.apellidos.value,
      telefono: form.telefono.value,
      edad: form.edad.value,
    };

    fetch("https://formspree.io/f/xnngndvr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    })
      .then(function (res) {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Error en el envío");
        }
      })
      .then(function (data) {
        if (window.mostrarModalExito) window.mostrarModalExito();
        form.reset();
      })
      .catch(function (err) {
        alert("Hubo un error al enviar el formulario.");
      });
  });
});
