// contacto-form.js
// Envía el formulario de contacto por AJAX y muestra mensaje de éxito o error

document.addEventListener("DOMContentLoaded", function () {
  // Buscar tanto el formulario de contacto como el de reserva de cita
  var form = document.querySelector("#formulario-contacto form") || document.querySelector("#form-reserva");
  if (!form) return;

  var btn = form ? form.querySelector('button.btn-enviar-formulario') : null;
  if (!form || !btn) return;

  // Función para mostrar mensaje de alerta
  function mostrarAlerta(mensaje, tipo) {
    // Eliminar alertas previas
    var alertaAnterior = document.querySelector('.alerta-formulario');
    if (alertaAnterior) {
      alertaAnterior.remove();
    }

    // Crear elemento de alerta
    var alerta = document.createElement('div');
    alerta.className = 'alerta-formulario alerta-' + tipo;
    alerta.innerHTML = '<p>' + mensaje + '</p>';

    // Insertar antes del botón
    form.insertBefore(alerta, btn);

    // Desaparecer después de 5 segundos
    setTimeout(function() {
      if (alerta && alerta.parentNode) {
        alerta.remove();
      }
    }, 5000);
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!form.nombre.value.trim() || !form.apellidos.value.trim() || !form.telefono.value.trim()) {
      mostrarAlerta('Por favor, completa todos los campos obligatorios.', 'error');
      return;
    }
    
    // Validar checkbox de privacidad si existe
    var checkboxPrivacidad = form.querySelector('input[name="aceptar-privacidad"]');
    if (checkboxPrivacidad && !checkboxPrivacidad.checked) {
      mostrarAlerta('Debes aceptar la Política de Privacidad para continuar.', 'error');
      return;
    }
    
    var datos = {
      nombre: form.nombre.value,
      apellidos: form.apellidos.value,
      telefono: form.telefono.value,
    };
    
    // Añadir edad solo si tiene valor
    if (form.edad.value.trim()) {
      datos.edad = form.edad.value;
    }
    
    // Añadir confirmación de privacidad a los datos si existe
    if (checkboxPrivacidad) {
      datos.privacidad_aceptada = checkboxPrivacidad.checked;
    }

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
        mostrarAlerta("Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.", "error");
      });
  });
});
