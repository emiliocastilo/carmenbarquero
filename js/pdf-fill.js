// === Generador de PDF de Consentimiento Informado ===
// Rellena el PDF original del usuario con datos + firma manuscrita

window.addEventListener("DOMContentLoaded", function () {
  initCanvasFirma();
  autoRellenarFecha();
});

// ==========================================
// CANVAS - FIRMA MANUSCRITA
// ==========================================

function initCanvasFirma() {
  const canvas = document.getElementById("canvas-firma");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  let dibujando = false;

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) * scaleX,
      y: ((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) * scaleY,
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

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    dibujando = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, { passive: false });
  
  canvas.addEventListener("touchmove", (e) => {
    if (!dibujando) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener("touchend", () => (dibujando = false));

  document.getElementById("limpiar-firma")?.addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

// ==========================================
// AUTO-RELLENAR FECHA
// ==========================================

function autoRellenarFecha() {
  const hoy = new Date();
  
  if (document.getElementById("dia")) {
    document.getElementById("dia").value = String(hoy.getDate()).padStart(2, '0');
  }
  
  if (document.getElementById("mes")) {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    document.getElementById("mes").value = meses[hoy.getMonth()];
  }
  
  if (document.getElementById("anio")) {
    document.getElementById("anio").value = hoy.getFullYear();
  }
}

// ==========================================
// VALIDACIÓN Y GENERACIÓN
// ==========================================

function canvasTieneFirma() {
  const canvas = document.getElementById("canvas-firma");
  if (!canvas) return false;
  const ctx = canvas.getContext("2d");
  const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 3; i < pixelData.length; i += 4) {
    if (pixelData[i] > 0) return true;
  }
  return false;
}

function validarFormulario() {
  const campos = {
    "nombre-apellidos": "Nombre y apellidos",
    "dni": "DNI/NIE",
    "fecha-nacimiento": "Fecha de nacimiento",
    "telefono": "Teléfono",
    "lugar": "Lugar (ciudad)"
  };
  
  const errores = [];
  
  // Limpiar errores previos
  document.querySelectorAll('.campo-dato input').forEach(input => {
    input.classList.remove('error');
  });
  document.getElementById('errores-validacion').style.display = 'none';
  
  for (const [id, nombre] of Object.entries(campos)) {
    const input = document.getElementById(id);
    if (!input || !input.value.trim()) {
      errores.push(nombre);
      if (input) input.classList.add('error');
    }
  }
  
  if (!canvasTieneFirma()) {
    errores.push("Firma manuscrita");
  }
  
  return errores;
}

async function generatePDF() {
  const errores = validarFormulario();
  if (errores.length > 0) {
    // Mostrar errores en panel visual en lugar de alert
    const panelErrores = document.getElementById('errores-validacion');
    panelErrores.innerHTML = `
      <h4>⚠️ Por favor, complete los siguientes campos:</h4>
      <ul>
        ${errores.map(e => `<li>${e}</li>`).join('')}
      </ul>
    `;
    panelErrores.style.display = 'block';
    panelErrores.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  
  const btn = document.getElementById("btn-confirmar");
  const textoOriginal = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Generando PDF...';
  btn.disabled = true;
  
  try {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    
    // Recolectar datos del formulario
    const datos = {
      nombreApellidos: document.getElementById("nombre-apellidos")?.value || "",
      dni: document.getElementById("dni")?.value || "",
      fechaNacimiento: document.getElementById("fecha-nacimiento")?.value || "",
      telefono: document.getElementById("telefono")?.value || "",
      lugar: document.getElementById("lugar")?.value || "",
      dia: document.getElementById("dia")?.value || "",
      mes: document.getElementById("mes")?.value || "",
      anio: document.getElementById("anio")?.value || ""
    };
    
    // Cargar PDF original
    const response = await fetch("docs/consentimiento-informado-template.pdf");
    if (!response.ok) {
      throw new Error("No se pudo cargar el PDF");
    }
    
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Escribir datos directamente en el PDF
    await escribirDatosEnPDF(pdfDoc, datos, StandardFonts, rgb);
    
    // Añadir firma
    await anadirFirma(pdfDoc);
    
    // Descargar
    const pdfModificado = await pdfDoc.save();
    descargarPDF(pdfModificado, datos.nombreApellidos);
    mostrarMensajeExito();
    
  } catch (error) {
    console.error("Error:", error);
    alert("Error: " + error.message);
  } finally {
    btn.innerHTML = textoOriginal;
    btn.disabled = false;
  }
}

// ==========================================
// ESCRIBIR DATOS EN PDF
// ==========================================

async function escribirDatosEnPDF(pdfDoc, datos, StandardFonts, rgb) {
  try {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Primera página - datos del paciente
    const pagina1 = pdfDoc.getPages()[0];
    const { height: h1 } = pagina1.getSize();
    
    // Posiciones basadas en análisis visual del PDF original
    // Las líneas están a estos offsets desde la parte superior
    const posiciones = [
      { texto: datos.nombreApellidos, x: 207, y: h1 - 258 },   // Nombre y apellidos
      { texto: datos.dni, x: 156, y: h1 - 277 },              // DNI/NIE
      { texto: datos.telefono, x: 214, y: h1 - 307 }          // Teléfono de contacto
    ];

    posiciones.forEach(pos => {
      if (pos.texto) {
        pagina1.drawText(pos.texto, {
          x: pos.x,
          y: pos.y,
          size: 11,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
    });
    
    // Fecha de nacimiento - escribir con "/" 
    // Usar el campo fecha-nacimiento que ya viene con "/
    if (datos.fechaNacimiento) {
      pagina1.drawText(datos.fechaNacimiento, {
        x: 212, y: h1 - 289, size: 11, font: font, color: rgb(0, 0, 0)
      });
    }
    
    console.log("✓ Datos escritos en página 1");
    
    // Tercera página (última) - fecha y lugar
    if (pdfDoc.getPageCount() >= 3) {
      const pagina3 = pdfDoc.getPages()[2];
      const { height: h3 } = pagina3.getSize();
      
      const posicionesFecha = [
        { texto: datos.lugar, x: 121, y: h3 - 274, label: "Lugar" },
        { texto: datos.dia, x: 234, y: h3 - 274, label: "Día" },
        { texto: datos.mes, x: 272, y: h3 - 274, label: "Mes" },
        { texto: datos.anio, x: 364, y: h3 - 274, label: "Año" }
      ];
      
      posicionesFecha.forEach(pos => {
        if (pos.texto) {
          pagina3.drawText(pos.texto, {
            x: pos.x,
            y: pos.y,
            size: 11,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
      });
      
      console.log("✓ Datos de fecha/lugar escritos en página 3");
    }
    
  } catch (error) {
    console.error("Error escribiendo datos:", error);
    throw error;
  }
}

// ==========================================
// FIRMA Y DESCARGA
// ==========================================

async function anadirFirma(pdfDoc) {
  const canvas = document.getElementById("canvas-firma");
  if (!canvas || !canvasTieneFirma()) return;
  
  try {
    const firmaDataUrl = canvas.toDataURL("image/png");
    const firmaBytes = await fetch(firmaDataUrl).then(res => res.arrayBuffer());
    const firmaImage = await pdfDoc.embedPng(firmaBytes);
    
    // Añadir firma a la última página (página 3)
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { height: h3 } = lastPage.getSize();
    
    // Escalar firma
    const maxWidth = 150;
    const maxHeight = 50;
    const ratio = Math.min(maxWidth / firmaImage.width, maxHeight / firmaImage.height);
    const fw = firmaImage.width * ratio;
    const fh = firmaImage.height * ratio;
    
    // Posicionar firma en coordenadas verificadas: { x: 115, y: h3 - 347 }
    lastPage.drawImage(firmaImage, {
      x: 115,
      y: h3 - 373,
      width: fw,
      height: fh
    });
    
    console.log("✓ Firma añadida en página 3");
  } catch (error) {
    console.log("Error añadiendo firma:", error);
  }
}

function descargarPDF(pdfBytes, nombrePaciente) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombrePaciente
    ? `consentimiento-${nombrePaciente.replace(/\s+/g, "-").toLowerCase()}.pdf`
    : "consentimiento-informado.pdf";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function mostrarMensajeExito() {
  const div = document.createElement("div");
  div.className = "mensaje-exito";
  div.innerHTML = `
    <div class="mensaje-exito-content">
      <span class="mensaje-exito-icon">✓</span>
      <p>¡PDF generado correctamente!</p>
      <p class="mensaje-exito-sub">El documento se ha descargado.</p>
    </div>
  `;
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.classList.add("mensaje-exito-fade");
    setTimeout(() => div.remove(), 500);
  }, 3000);
}

window.generatePDF = generatePDF;
