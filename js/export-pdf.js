// --- Firma manuscrita en canvas ---
window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas-firma");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let dibujando = false;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
      y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top,
    };
  }

  canvas.addEventListener("mousedown", (e) => {
    dibujando = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!dibujando) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  });
  canvas.addEventListener("mouseup", () => (dibujando = false));
  canvas.addEventListener("mouseleave", () => (dibujando = false));

  // Soporte táctil
  canvas.addEventListener("touchstart", (e) => {
    dibujando = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });
  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (!dibujando) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      e.preventDefault();
    },
    { passive: false }
  );
  canvas.addEventListener("touchend", () => (dibujando = false));

  // Botón limpiar
  document
    .getElementById("limpiar-firma")
    .addEventListener("click", function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});
function generatePDF() {
  const form = document.getElementById("form-datos-paciente");
  // Clonar el formulario
  const clone = form.cloneNode(true);
  // Reemplazar los inputs por spans con el valor
  const inputs = clone.querySelectorAll("input");
  inputs.forEach((input) => {
    const span = document.createElement("span");
    span.textContent = input.value || "";
    span.style.borderBottom = "1px solid #ccc";
    span.style.padding = "2px 6px";
    span.style.minWidth = "80px";
    span.style.display = "inline-block";
    input.parentNode.replaceChild(span, input);
  });
  // Crear un contenedor temporal para el clon
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "fixed";
  tempDiv.style.left = "-9999px";
  tempDiv.appendChild(clone);
  document.body.appendChild(tempDiv);

  // Genera y descarga el PDF
  html2pdf()
    .set({
      margin: 0,
      filename: "consentimiento.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(clone)
    .save()
    .then(() => {
      // Eliminar el clon temporal
      document.body.removeChild(tempDiv);
    });
}
