// === Generador de PDF de Consentimiento Informado ===
// Rellena el PDF original con los datos del formulario
// Coordenadas calibradas para escribir datos en el PDF
// Página 1 (datos de la persona) es idéntica entre la plantilla actual (60€) y la anterior (50€)
const coordenadas = {
  nombre: { x: 158, y: 581 },
  apellidos: { x: 162, y: 566 },
  dni: { x: 157, y: 550 },
  dia: { x: 213, y: 535 },
  mes: { x: 245, y: 535 },
  anio: { x: 276, y: 535 },
  telefono: { x: 216, y: 519 },
  email: { x: 200, y: 504 },
  domicilio: { x: 163, y: 488 },
  codigoPostal: { x: 178, y: 473 }
};

// Página 3 (firma) difiere entre plantillas por el distinto texto de cada una
const coordenadasFirmaPorPlantilla = {
  actual: {
    lugar: { x: 123, y: 579 },
    firmaFechaDia: { x: 235, y: 579 },
    firmaFechaMes: { x: 273, y: 579 },
    firmaFechaAnio: { x: 366, y: 579 },
    firmaImagen: { x: 115, y: 470 }
  },
  anterior: {
    lugar: { x: 123, y: 553 },
    firmaFechaDia: { x: 235, y: 553 },
    firmaFechaMes: { x: 273, y: 553 },
    firmaFechaAnio: { x: 366, y: 553 },
    firmaImagen: { x: 115, y: 444 }
  }
};
// --- Firma manuscrita en canvas ---
window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas-firma");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let dibujando = false;

  // Configurar estilo del trazo
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

  // Soporte táctil
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

  // Botón limpiar
  document.getElementById("limpiar-firma")?.addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Poblar selects de fecha de nacimiento
  const selectDiaNac = document.getElementById("fecha-nacimiento-dia");
  const selectAnioNac = document.getElementById("fecha-nacimiento-anio");

  if (selectDiaNac) {
    for (let i = 1; i <= 31; i++) {
      const option = document.createElement("option");
      option.value = i.toString().padStart(2, '0');
      option.textContent = i;
      selectDiaNac.appendChild(option);
    }
  }

  if (selectAnioNac) {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= 1920; i--) {
      const option = document.createElement("option");
      option.value = i.toString();
      option.textContent = i;
      selectAnioNac.appendChild(option);
    }
  }

  // Auto-rellenar fecha actual (para la sección de firmas)
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

// Verificar si el canvas tiene firma
function tieneCanvasFirma() {
  const canvas = document.getElementById("canvas-firma");
  if (!canvas) return false;
  const ctx = canvas.getContext("2d");
  const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 3; i < pixelData.length; i += 4) {
    if (pixelData[i] > 0) return true;
  }
  return false;
}

// Parsear fecha en formato dd/mm/yyyy a componentes
function parsearFecha(fechaStr) {
  console.log("📅 Parseando fecha:", fechaStr);
  fechaStr = fechaStr.trim();
  
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const dia = partes[0].trim().padStart(2, '0');
    const mes = partes[1].trim().padStart(2, '0');
    const anio = partes[2].trim();
    
    console.log("✓ Fecha parseada:", { dia, mes, anio });
    return { dia, mes, anio };
  }
  
  console.warn("⚠️ No se pudo parsear la fecha");
  return { dia: "", mes: "", anio: "" };
}

// Validar formulario
function validarFormulario() {
  const campos = {
    "nombre": "Nombre",
    "apellidos": "Apellidos",
    "dni": "DNI/NIE",
    "telefono": "Teléfono",
    "email": "Correo electrónico",
    "domicilio": "Domicilio",
    "codigo-postal": "Código postal",
    "lugar": "Lugar (ciudad)"
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

  // Validar fecha de nacimiento (selects separados)
  const fechaDia = document.getElementById("fecha-nacimiento-dia");
  const fechaMes = document.getElementById("fecha-nacimiento-mes");
  const fechaAnio = document.getElementById("fecha-nacimiento-anio");

  if (!fechaDia?.value || !fechaMes?.value || !fechaAnio?.value) {
    errores.push("Fecha de nacimiento");
    fechaDia?.classList.add('campo-error');
    fechaMes?.classList.add('campo-error');
    fechaAnio?.classList.add('campo-error');
  } else {
    fechaDia?.classList.remove('campo-error');
    fechaMes?.classList.remove('campo-error');
    fechaAnio?.classList.remove('campo-error');
  }
  
  if (!tieneCanvasFirma()) {
    errores.push("Firma manuscrita");
  }
  
  // Mostrar errores en panel
  const panelErrores = document.getElementById("errores-validacion");
  if (errores.length > 0) {
    panelErrores.innerHTML = `
      <strong>⚠️ Faltan campos por completar:</strong>
      <ul>
        ${errores.map(e => `<li>${e}</li>`).join('')}
      </ul>
    `;
    panelErrores.style.display = 'block';
    panelErrores.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    panelErrores.style.display = 'none';
  }
  
  return errores.length === 0;
}

// Función principal para generar PDF
async function generatePDF() {
  console.log("🚀 Iniciando generación de PDF...");
  
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
    console.log("✓ PDFLib cargado");
    
    // Obtener datos del formulario
    const datos = {
      nombre: document.getElementById("nombre")?.value || "",
      apellidos: document.getElementById("apellidos")?.value || "",
      dni: document.getElementById("dni")?.value || "",
      telefono: document.getElementById("telefono")?.value || "",
      email: document.getElementById("email")?.value || "",
      domicilio: document.getElementById("domicilio")?.value || "",
      codigoPostal: document.getElementById("codigo-postal")?.value || "",
      lugar: document.getElementById("lugar")?.value || "",
    };
    datos.nombreApellidos = `${datos.nombre} ${datos.apellidos}`.trim();

    console.log("📋 Datos del formulario:", datos);

    // Obtener fecha de nacimiento de los selects
    const fechaParsed = {
      dia: document.getElementById("fecha-nacimiento-dia")?.value || "",
      mes: document.getElementById("fecha-nacimiento-mes")?.value || "",
      anio: document.getElementById("fecha-nacimiento-anio")?.value || ""
    };

    console.log("📅 Fecha de nacimiento:", fechaParsed);
    
    // Detectar si es producción o desarrollo
    const isProduction = window.location.hostname === 'www.carmenbarqueropsicologia.es' || 
                        window.location.hostname === 'carmenbarqueropsicologia.es';
    const usarAnterior = window.PLANTILLA_PDF === 'anterior';
    const baseUrl = isProduction
      ? 'https://www.carmenbarqueropsicologia.es/'
      : 'docs/';
    const templateUrl = baseUrl + (usarAnterior
      ? 'consentimiento-informado-template-old.pdf'
      : 'consentimiento-informado-template.pdf');
    
    console.log("🔗 Cargando PDF desde:", templateUrl);
    
    // Cargar el PDF original como plantilla
    const response = await fetch(templateUrl);
    
    if (!response.ok) {
      throw new Error("No se pudo cargar el PDF original (status: " + response.status + ")");
    }
    
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    console.log("✓ PDF cargado correctamente");
    
    // Rellenar el PDF
    const coordenadasFirma = usarAnterior ? coordenadasFirmaPorPlantilla.anterior : coordenadasFirmaPorPlantilla.actual;
    await rellenarPDFOriginal(pdfDoc, datos, fechaParsed, coordenadasFirma);

    // Adjuntar los datos en formato estructurado (JSON) para que otra app pueda recuperarlos
    await adjuntarDatosEstructurados(pdfDoc, datos, fechaParsed);

    // Guardar y descargar
    const pdfModificado = await pdfDoc.save();
    console.log("✓ PDF guardado, size:", pdfModificado.length, "bytes");
    
    descargarPDF(pdfModificado, datos.nombreApellidos);
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

// Rellenar el PDF original con los datos
async function rellenarPDFOriginal(pdfDoc, datos, fechaParsed, coordenadasFirma) {
  try {
    // Estos PDF no usan campos AcroForm: se escribe el texto directamente sobre el documento
    await escribirDatosDirectamente(pdfDoc, datos, fechaParsed, coordenadasFirma);
    await anadirFirma(pdfDoc, coordenadasFirma);
  } catch (error) {
    console.error("❌ Error en rellenarPDFOriginal:", error);
    throw error;
  }
}

// Escribir datos directamente sobre el PDF
async function escribirDatosDirectamente(pdfDoc, datos, fechaParsed, coordenadasFirma) {
  const { rgb, StandardFonts } = PDFLib;

  try {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    console.log("📄 Total de páginas:", pages.length);

    // Página 1: datos personales
    if (pages.length > 0) {
      const page1 = pages[0];
      const { height: h1, width: w1 } = page1.getSize();
      const fontSize = 11;
      const color = rgb(0, 0, 0);

      console.log("📐 Página 1 - Dimensiones:", { width: w1, height: h1 });
      console.log("📍 Usando coordenadas:", coordenadas);

      const draw1 = (text, coords) => {
        if (text) page1.drawText(text, { x: coords.x, y: coords.y, size: fontSize, font, color });
      };

      draw1(datos.nombre, coordenadas.nombre);
      draw1(datos.apellidos, coordenadas.apellidos);
      draw1(datos.dni, coordenadas.dni);
      draw1(fechaParsed.dia, coordenadas.dia);
      draw1(fechaParsed.mes, coordenadas.mes);
      draw1(fechaParsed.anio, coordenadas.anio);
      draw1(datos.telefono, coordenadas.telefono);
      draw1(datos.email, coordenadas.email);
      draw1(datos.domicilio, coordenadas.domicilio);
      draw1(datos.codigoPostal, coordenadas.codigoPostal);

      console.log("✓ Página 1 completada");
    }

    // Página 3: fecha de firma y firma
    if (pages.length > 2) {
      const page3 = pages[2];
      const fontSize = 11;
      const color = rgb(0, 0, 0);

      if (datos.lugar) {
        page3.drawText(datos.lugar, {
          x: coordenadasFirma.lugar.x,
          y: coordenadasFirma.lugar.y,
          size: fontSize, font: font, color: color
        });
        console.log("✓ Lugar escrito:", datos.lugar, "en", coordenadasFirma.lugar);
      }

      // Obtener fecha de firma directamente del formulario
      const diaFirma = document.getElementById("dia")?.value || "";
      const mesFirma = document.getElementById("mes")?.value || "";
      const anioFirma = document.getElementById("anio")?.value || "";

      page3.drawText(diaFirma, {
        x: coordenadasFirma.firmaFechaDia.x,
        y: coordenadasFirma.firmaFechaDia.y,
        size: fontSize, font: font, color: color
      });
      console.log("✓ Día firma escrito:", diaFirma, "en", coordenadasFirma.firmaFechaDia);

      page3.drawText(mesFirma, {
        x: coordenadasFirma.firmaFechaMes.x,
        y: coordenadasFirma.firmaFechaMes.y,
        size: fontSize, font: font, color: color
      });
      console.log("✓ Mes firma escrito:", mesFirma, "en", coordenadasFirma.firmaFechaMes);

      page3.drawText(anioFirma, {
        x: coordenadasFirma.firmaFechaAnio.x,
        y: coordenadasFirma.firmaFechaAnio.y,
        size: fontSize, font: font, color: color
      });
      console.log("✓ Año firma escrito:", anioFirma, "en", coordenadasFirma.firmaFechaAnio);

      console.log("✓ Página 3 completada");
    }

    console.log("✓✓✓ Todos los datos escritos correctamente ✓✓✓");
  } catch (error) {
    console.error("❌ Error escribiendo datos directamente:", error);
    throw error;
  }
}

// Añadir firma al PDF
async function anadirFirma(pdfDoc, coordenadasFirma) {
  const canvas = document.getElementById("canvas-firma");
  if (!canvas || !tieneCanvasFirma()) {
    console.log("⚠️ No hay firma para añadir");
    return;
  }

  try {
    const firmaDataUrl = canvas.toDataURL("image/png");
    const firmaBytes = await fetch(firmaDataUrl).then(res => res.arrayBuffer());
    const firmaImage = await pdfDoc.embedPng(firmaBytes);

    const pages = pdfDoc.getPages();
    if (pages.length > 2) {
      const page3 = pages[2];

      const maxWidth = 180;
      const maxHeight = 60;
      const ratio = Math.min(maxWidth / firmaImage.width, maxHeight / firmaImage.height);
      const firmaWidth = firmaImage.width * ratio;
      const firmaHeight = firmaImage.height * ratio;

      page3.drawImage(firmaImage, {
        x: coordenadasFirma.firmaImagen.x,
        y: coordenadasFirma.firmaImagen.y,
        width: firmaWidth,
        height: firmaHeight,
      });

      console.log("✓ Firma añadida al PDF en", coordenadasFirma.firmaImagen);
    }
  } catch (error) {
    console.log("❌ Error al añadir firma:", error);
  }
}

// Adjuntar datos estructurados (JSON) embebidos en el PDF para recuperación programática
async function adjuntarDatosEstructurados(pdfDoc, datos, fechaParsed) {
  try {
    const diaFirma = document.getElementById("dia")?.value || "";
    const mesFirma = document.getElementById("mes")?.value || "";
    const anioFirma = document.getElementById("anio")?.value || "";

    const datosEstructurados = {
      tipo: "consentimiento-individual",
      version: 2,
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      nombreApellidos: datos.nombreApellidos,
      dni: datos.dni,
      fechaNacimiento: `${fechaParsed.dia}/${fechaParsed.mes}/${fechaParsed.anio}`,
      telefono: datos.telefono,
      email: datos.email,
      domicilio: datos.domicilio,
      codigoPostal: datos.codigoPostal,
      lugar: datos.lugar,
      fechaFirma: `${diaFirma}/${mesFirma}/${anioFirma}`,
      generadoEl: new Date().toISOString()
    };

    await pdfDoc.attach(
      new TextEncoder().encode(JSON.stringify(datosEstructurados, null, 2)),
      "datos-consentimiento.json",
      {
        mimeType: "application/json",
        description: "Datos estructurados del consentimiento informado"
      }
    );

    console.log("✓ Datos estructurados adjuntados al PDF:", datosEstructurados);
  } catch (error) {
    console.log("⚠️ No se pudieron adjuntar los datos estructurados:", error);
  }
}

// Descargar PDF
function descargarPDF(pdfBytes, nombrePaciente) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const nombreArchivo = nombrePaciente 
    ? `consentimiento-${nombrePaciente.replace(/\s+/g, "-").toLowerCase()}.pdf`
    : "consentimiento-informado.pdf";
  link.download = nombreArchivo;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log("📥 Descarga iniciada:", nombreArchivo);
}

// Mostrar mensaje de éxito
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
