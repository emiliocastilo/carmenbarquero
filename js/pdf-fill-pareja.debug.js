// === Generador de PDF de Consentimiento Informado - Terapia de Pareja ===
const coordenadasPareja = {
  // Página 1 - Persona 1
  nombre1:       { x: 210, y: 581 },
  dni1:          { x: 158, y: 566 },
  dia1:          { x: 212, y: 551 },
  mes1:          { x: 242, y: 551 },
  anio1:         { x: 272, y: 551 },
  telefono1:     { x: 215, y: 536 },
  // Página 1 - Persona 2
  nombre2:       { x: 210, y: 486 },
  dni2:          { x: 158, y: 471 },
  dia2:          { x: 212, y: 455 },
  mes2:          { x: 242, y: 455 },
  anio2:         { x: 272, y: 455 },
  telefono2:     { x: 215, y: 438 },
  // Página 3 - Fecha de firma (línea "En __, a __ de...")
  lugar:         { x: 124, y: 598 },
  firmaFechaDia: { x: 238, y: 598 },
  firmaFechaMes: { x: 275, y: 598 },
  firmaFechaAnio:{ x: 365, y: 598 },
  // Página 3 - Firmas lado a lado
  firmaImagen1:  { x: 80,  y: 455 },
  firmaImagen2:  { x: 310, y: 455 },
};

function setupCanvas(canvasId, limpiarId) {
  const canvas = document.getElementById(canvasId);
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

  document.getElementById(limpiarId)?.addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

window.addEventListener("DOMContentLoaded", function () {
  setupCanvas("canvas-firma-1", "limpiar-firma-1");
  setupCanvas("canvas-firma-2", "limpiar-firma-2");

  // Poblar selects de fecha de nacimiento para ambas personas
  ["1", "2"].forEach(sufijo => {
    const selectDia = document.getElementById(`fecha-nacimiento-dia-${sufijo}`);
    const selectAnio = document.getElementById(`fecha-nacimiento-anio-${sufijo}`);

    if (selectDia) {
      for (let i = 1; i <= 31; i++) {
        const option = document.createElement("option");
        option.value = i.toString().padStart(2, '0');
        option.textContent = i;
        selectDia.appendChild(option);
      }
    }

    if (selectAnio) {
      const anioActual = new Date().getFullYear();
      for (let i = anioActual; i >= 1920; i--) {
        const option = document.createElement("option");
        option.value = i.toString();
        option.textContent = i;
        selectAnio.appendChild(option);
      }
    }
  });

  // Auto-rellenar fecha actual para la sección de firmas
  const hoy = new Date();
  const dia = document.getElementById("dia");
  const mes = document.getElementById("mes");
  const anio = document.getElementById("anio");

  if (dia) dia.value = hoy.getDate();
  if (mes) {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                   "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    mes.value = meses[hoy.getMonth()];
  }
  if (anio) anio.value = hoy.getFullYear();
});

function tieneCanvasFirma(canvasId) {
  const canvas = document.getElementById(canvasId);
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
    "nombre-apellidos-1": "Nombre y apellidos (persona 1)",
    "dni-1":              "DNI/NIE (persona 1)",
    "telefono-1":         "Teléfono (persona 1)",
    "nombre-apellidos-2": "Nombre y apellidos (persona 2)",
    "dni-2":              "DNI/NIE (persona 2)",
    "telefono-2":         "Teléfono (persona 2)",
    "lugar":              "Lugar (ciudad)",
  };

  const errores = [];

  for (const [id, nombre] of Object.entries(campos)) {
    const input = document.getElementById(id);
    if (!input || !input.value.trim()) {
      errores.push(nombre);
      input?.classList.add('campo-error');
    } else {
      input?.classList.remove('campo-error');
    }
  }

  // Fechas de nacimiento
  ["1", "2"].forEach(sufijo => {
    const fechaDia  = document.getElementById(`fecha-nacimiento-dia-${sufijo}`);
    const fechaMes  = document.getElementById(`fecha-nacimiento-mes-${sufijo}`);
    const fechaAnio = document.getElementById(`fecha-nacimiento-anio-${sufijo}`);
    if (!fechaDia?.value || !fechaMes?.value || !fechaAnio?.value) {
      errores.push(`Fecha de nacimiento (persona ${sufijo})`);
      fechaDia?.classList.add('campo-error');
      fechaMes?.classList.add('campo-error');
      fechaAnio?.classList.add('campo-error');
    } else {
      fechaDia?.classList.remove('campo-error');
      fechaMes?.classList.remove('campo-error');
      fechaAnio?.classList.remove('campo-error');
    }
  });

  if (!tieneCanvasFirma("canvas-firma-1")) errores.push("Firma de la primera persona");
  if (!tieneCanvasFirma("canvas-firma-2")) errores.push("Firma de la segunda persona");

  const panelErrores = document.getElementById("errores-validacion");
  if (errores.length > 0) {
    panelErrores.innerHTML = `
      <strong>⚠️ Faltan campos por completar:</strong>
      <ul>${errores.map(e => `<li>${e}</li>`).join('')}</ul>
    `;
    panelErrores.style.display = 'block';
    panelErrores.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    panelErrores.style.display = 'none';
  }

  return errores.length === 0;
}

async function generatePDF() {
  console.log("🚀 Iniciando generación de PDF pareja...");

  if (!validarFormulario()) {
    console.log("❌ Validación fallida");
    return;
  }

  const btn = document.getElementById("btn-confirmar");
  const textoOriginal = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Generando PDF...';
  btn.disabled = true;

  try {
    const { PDFDocument } = PDFLib;

    const datos1 = {
      nombreApellidos: document.getElementById("nombre-apellidos-1")?.value || "",
      dni:             document.getElementById("dni-1")?.value || "",
      telefono:        document.getElementById("telefono-1")?.value || "",
    };
    const fecha1 = {
      dia:  document.getElementById("fecha-nacimiento-dia-1")?.value || "",
      mes:  document.getElementById("fecha-nacimiento-mes-1")?.value || "",
      anio: document.getElementById("fecha-nacimiento-anio-1")?.value || "",
    };
    const datos2 = {
      nombreApellidos: document.getElementById("nombre-apellidos-2")?.value || "",
      dni:             document.getElementById("dni-2")?.value || "",
      telefono:        document.getElementById("telefono-2")?.value || "",
    };
    const fecha2 = {
      dia:  document.getElementById("fecha-nacimiento-dia-2")?.value || "",
      mes:  document.getElementById("fecha-nacimiento-mes-2")?.value || "",
      anio: document.getElementById("fecha-nacimiento-anio-2")?.value || "",
    };

    const isProduction = window.location.hostname === 'www.carmenbarqueropsicologia.es' ||
                         window.location.hostname === 'carmenbarqueropsicologia.es';
    const baseUrl = isProduction ? 'https://www.carmenbarqueropsicologia.es/' : 'docs/';
    const templateUrl = baseUrl + 'consentimiento-informado-pareja.pdf';

    console.log("🔗 Cargando PDF desde:", templateUrl);

    const response = await fetch(templateUrl);
    if (!response.ok) throw new Error("No se pudo cargar el PDF (status: " + response.status + ")");

    const pdfBytes = await response.arrayBuffer();
    const pdfDoc  = await PDFDocument.load(pdfBytes);
    console.log("✓ PDF cargado");

    await rellenarPDFOriginal(pdfDoc, datos1, datos2, fecha1, fecha2);

    const pdfModificado = await pdfDoc.save();
    descargarPDF(pdfModificado, datos1.nombreApellidos);
    mostrarMensajeExito();

  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    const panelErrores = document.getElementById("errores-validacion");
    panelErrores.innerHTML = `<strong>❌ Error:</strong> ${error.message}`;
    panelErrores.style.display = 'block';
  } finally {
    btn.innerHTML = textoOriginal;
    btn.disabled = false;
  }
}

async function rellenarPDFOriginal(pdfDoc, datos1, datos2, fecha1, fecha2) {
  try {
    const form   = pdfDoc.getForm();
    const fields = form.getFields();
    console.log("🔍 Campos AcroForm:", fields.map(f => f.getName()));

    if (fields.length > 0) {
      // Intentar rellenar AcroForm si los tiene
      fields.forEach(field => {
        try { field.setText && field.setText(""); } catch (e) {}
      });
      try { form.flatten(); } catch (e) {}
    }

    // Siempre escribir directamente (el PDF de pareja no tiene AcroForm)
    await escribirDatosDirectamente(pdfDoc, datos1, datos2, fecha1, fecha2);
    await anadirFirmas(pdfDoc);

  } catch (error) {
    console.error("❌ Error en rellenarPDFOriginal:", error);
    await escribirDatosDirectamente(pdfDoc, datos1, datos2, fecha1, fecha2);
    await anadirFirmas(pdfDoc);
  }
}

async function escribirDatosDirectamente(pdfDoc, datos1, datos2, fecha1, fecha2) {
  const { rgb, StandardFonts } = PDFLib;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const fontSize = 11;
  const color = rgb(0, 0, 0);

  console.log("📄 Páginas:", pages.length);

  // Página 1: datos de ambas personas
  if (pages.length > 0) {
    const page1 = pages[0];

    const drawIfValue = (text, coords) => {
      if (text) page1.drawText(text, { x: coords.x, y: coords.y, size: fontSize, font, color });
    };

    drawIfValue(datos1.nombreApellidos, coordenadasPareja.nombre1);
    drawIfValue(datos1.dni,             coordenadasPareja.dni1);
    drawIfValue(fecha1.dia,             coordenadasPareja.dia1);
    drawIfValue(fecha1.mes,             coordenadasPareja.mes1);
    drawIfValue(fecha1.anio,            coordenadasPareja.anio1);
    drawIfValue(datos1.telefono,        coordenadasPareja.telefono1);

    drawIfValue(datos2.nombreApellidos, coordenadasPareja.nombre2);
    drawIfValue(datos2.dni,             coordenadasPareja.dni2);
    drawIfValue(fecha2.dia,             coordenadasPareja.dia2);
    drawIfValue(fecha2.mes,             coordenadasPareja.mes2);
    drawIfValue(fecha2.anio,            coordenadasPareja.anio2);
    drawIfValue(datos2.telefono,        coordenadasPareja.telefono2);

    console.log("✓ Página 1 completada");
  }

  // Página 3: lugar y fecha de firma
  if (pages.length > 2) {
    const page3 = pages[2];
    const diaFirma  = document.getElementById("dia")?.value  || "";
    const mesFirma  = document.getElementById("mes")?.value  || "";
    const anioFirma = document.getElementById("anio")?.value || "";
    const lugar     = document.getElementById("lugar")?.value || "";

    const draw3 = (text, coords) => {
      if (text) page3.drawText(text, { x: coords.x, y: coords.y, size: fontSize, font, color });
    };

    draw3(lugar,    coordenadasPareja.lugar);
    draw3(diaFirma, coordenadasPareja.firmaFechaDia);
    draw3(mesFirma, coordenadasPareja.firmaFechaMes);
    draw3(anioFirma,coordenadasPareja.firmaFechaAnio);

    console.log("✓ Página 3 completada");
  }
}

async function embedFirma(pdfDoc, canvasId, coords) {
  if (!tieneCanvasFirma(canvasId)) {
    console.log(`⚠️ Sin firma en ${canvasId}`);
    return;
  }

  try {
    const canvas = document.getElementById(canvasId);
    const firmaDataUrl = canvas.toDataURL("image/png");
    const firmaBytes   = await fetch(firmaDataUrl).then(r => r.arrayBuffer());
    const firmaImage   = await pdfDoc.embedPng(firmaBytes);

    const pages = pdfDoc.getPages();
    if (pages.length > 2) {
      const page3 = pages[2];
      const maxWidth = 180;
      const maxHeight = 60;
      const ratio = Math.min(maxWidth / firmaImage.width, maxHeight / firmaImage.height);

      page3.drawImage(firmaImage, {
        x: coords.x,
        y: coords.y,
        width:  firmaImage.width  * ratio,
        height: firmaImage.height * ratio,
      });

      console.log(`✓ Firma ${canvasId} añadida en`, coords);
    }
  } catch (error) {
    console.log(`❌ Error al añadir firma ${canvasId}:`, error);
  }
}

async function anadirFirmas(pdfDoc) {
  await embedFirma(pdfDoc, "canvas-firma-1", coordenadasPareja.firmaImagen1);
  await embedFirma(pdfDoc, "canvas-firma-2", coordenadasPareja.firmaImagen2);
}

function descargarPDF(pdfBytes, nombrePaciente) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href  = url;

  const nombreArchivo = nombrePaciente
    ? `consentimiento-pareja-${nombrePaciente.replace(/\s+/g, "-").toLowerCase()}.pdf`
    : "consentimiento-informado-pareja.pdf";
  link.download = nombreArchivo;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log("📥 Descarga iniciada:", nombreArchivo);
}

function mostrarMensajeExito() {
  const mensajeDiv = document.createElement("div");
  mensajeDiv.className = "mensaje-exito";
  mensajeDiv.innerHTML = `
    <div class="mensaje-exito-content">
      <span class="mensaje-exito-icon">✓</span>
      <p>¡PDF generado correctamente!</p>
      <p class="mensaje-exito-sub">El documento se ha descargado en tu dispositivo.</p>
    </div>
  `;
  document.body.appendChild(mensajeDiv);

  setTimeout(() => {
    mensajeDiv.classList.add("mensaje-exito-fade");
    setTimeout(() => mensajeDiv.remove(), 500);
  }, 3000);
}

window.generatePDF = generatePDF;
