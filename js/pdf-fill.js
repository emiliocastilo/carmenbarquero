// === Generador de PDF de Consentimiento Informado ===
// Rellena el PDF original con los datos del formulario

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

  // Auto-rellenar fecha actual
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
    const dia = partes[0].trim();
    const mesNum = partes[1].trim();
    const anio = partes[2].trim();
    
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", 
                   "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const mesIdx = parseInt(mesNum) - 1;
    const mesNombre = (mesIdx >= 0 && mesIdx < 12) ? meses[mesIdx] : mesNum;
    
    console.log("✓ Fecha parseada:", { dia, mes: mesNombre, anio });
    return { dia, mes: mesNombre, anio };
  }
  
  console.warn("⚠️ No se pudo parsear la fecha");
  return { dia: "", mes: "", anio: "" };
}

// Validar formulario
function validarFormulario() {
  const campos = {
    "nombre-apellidos": "Nombre y apellidos",
    "dni": "DNI/NIE",
    "fecha-nacimiento": "Fecha de nacimiento",
    "telefono": "Teléfono",
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
      nombreApellidos: document.getElementById("nombre-apellidos")?.value || "",
      dni: document.getElementById("dni")?.value || "",
      fechaNacimiento: document.getElementById("fecha-nacimiento")?.value || "",
      telefono: document.getElementById("telefono")?.value || "",
      lugar: document.getElementById("lugar")?.value || "",
    };
    
    console.log("📋 Datos del formulario:", datos);
    
    // Parsear la fecha de nacimiento
    const fechaParsed = parsearFecha(datos.fechaNacimiento);
    
    // Detectar si es producción o desarrollo
    const isProduction = window.location.hostname === 'www.carmenbarqueropsicologia.es' || 
                        window.location.hostname === 'carmenbarqueropsicologia.es';
    const templateUrl = isProduction 
      ? 'https://www.carmenbarqueropsicologia.es/consentimiento-informado-template.pdf'
      : './docs/consentimiento-informado-template.pdf';
    
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
    await rellenarPDFOriginal(pdfDoc, datos, fechaParsed);
    
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
async function rellenarPDFOriginal(pdfDoc, datos, fechaParsed) {
  try {
    // Intentar obtener el formulario
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log("🔍 Campos encontrados en el PDF:", fields.map(f => f.getName()));
    
    if (fields.length > 0) {
      // Hay campos AcroForm, rellenarlos
      const mappeosCampos = [
        { patrones: ["nombre", "apellidos", "paciente", "persona", "usuario"], valor: datos.nombreApellidos },
        { patrones: ["dni", "nie", "documento", "identidad"], valor: datos.dni },
        { patrones: ["nacimiento", "birth"], valor: datos.fechaNacimiento },
        { patrones: ["telefono", "phone", "movil", "contacto"], valor: datos.telefono },
        { patrones: ["ciudad", "lugar", "localidad"], valor: datos.lugar },
        { patrones: ["dia", "day"], valor: fechaParsed.dia },
        { patrones: ["mes", "month"], valor: fechaParsed.mes },
        { patrones: ["año", "anio", "year"], valor: fechaParsed.anio }
      ];
      
      fields.forEach(field => {
        const nombreCampo = field.getName().toLowerCase();
        
        for (const mapeo of mappeosCampos) {
          if (mapeo.patrones.some(p => nombreCampo.includes(p))) {
            try {
              if (typeof field.setText === 'function' && mapeo.valor) {
                field.setText(mapeo.valor);
                console.log(`✓ Campo rellenado: ${field.getName()} = ${mapeo.valor}`);
              }
            } catch (e) {
              console.log(`⚠️ No se pudo rellenar el campo ${field.getName()}`);
            }
            break;
          }
        }
      });
      
      try {
        form.flatten();
        console.log("✓ Formulario aplanado");
      } catch (e) {
        console.log("⚠️ No se pudo aplanar el formulario");
      }
    } else {
      // Sin campos AcroForm, escribir directamente
      console.log("📝 Sin campos AcroForm, escribiendo directamente...");
      await escribirDatosDirectamente(pdfDoc, datos, fechaParsed);
    }
    
    // Añadir firma en cualquier caso
    await anadirFirma(pdfDoc);
    
  } catch (error) {
    console.error("❌ Error en rellenarPDFOriginal:", error);
    console.log("📝 Intentando escribir directamente...");
    await escribirDatosDirectamente(pdfDoc, datos, fechaParsed);
    await anadirFirma(pdfDoc);
  }
}

// Escribir datos directamente sobre el PDF
async function escribirDatosDirectamente(pdfDoc, datos, fechaParsed) {
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
      
      if (datos.nombreApellidos) {
        page1.drawText(datos.nombreApellidos, {
          x: 170, y: h1 - 258, size: fontSize, font: font, color: color
        });
        console.log("✓ Nombre escrito:", datos.nombreApellidos);
      }
      
      if (datos.dni) {
        page1.drawText(datos.dni, {
          x: 120, y: h1 - 277, size: fontSize, font: font, color: color
        });
        console.log("✓ DNI escrito:", datos.dni);
      }
      
      if (fechaParsed.dia) {
        page1.drawText(fechaParsed.dia, {
          x: 120, y: h1 - 289, size: fontSize, font: font, color: color
        });
        console.log("✓ Día escrito:", fechaParsed.dia);
      }
      
      if (fechaParsed.mes) {
        page1.drawText(fechaParsed.mes, {
          x: 170, y: h1 - 289, size: fontSize, font: font, color: color
        });
        console.log("✓ Mes escrito:", fechaParsed.mes);
      }
      
      if (fechaParsed.anio) {
        page1.drawText(fechaParsed.anio, {
          x: 270, y: h1 - 289, size: fontSize, font: font, color: color
        });
        console.log("✓ Año escrito:", fechaParsed.anio);
      }
      
      if (datos.telefono) {
        page1.drawText(datos.telefono, {
          x: 170, y: h1 - 307, size: fontSize, font: font, color: color
        });
        console.log("✓ Teléfono escrito:", datos.telefono);
      }
      
      console.log("✓ Página 1 completada");
    }
    
    // Página 3: fecha de firma y firma
    if (pages.length > 2) {
      const page3 = pages[2];
      const { height: h3 } = page3.getSize();
      const fontSize = 11;
      const color = rgb(0, 0, 0);
      
      if (datos.lugar) {
        page3.drawText(datos.lugar, {
          x: 115, y: h3 - 274, size: fontSize, font: font, color: color
        });
        console.log("✓ Lugar escrito:", datos.lugar);
      }
      
      const hoy = new Date();
      page3.drawText(hoy.getDate().toString(), {
        x: 115, y: h3 - 282, size: fontSize, font: font, color: color
      });
      
      const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", 
                     "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      page3.drawText(meses[hoy.getMonth()], {
        x: 160, y: h3 - 282, size: fontSize, font: font, color: color
      });
      
      page3.drawText(hoy.getFullYear().toString(), {
        x: 280, y: h3 - 282, size: fontSize, font: font, color: color
      });
      
      console.log("✓ Página 3 completada");
    }
    
    console.log("✓✓✓ Todos los datos escritos correctamente ✓✓✓");
  } catch (error) {
    console.error("❌ Error escribiendo datos directamente:", error);
    throw error;
  }
}

// Añadir firma al PDF
async function anadirFirma(pdfDoc) {
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
      const { height: h3 } = page3.getSize();
      
      const maxWidth = 180;
      const maxHeight = 60;
      const ratio = Math.min(maxWidth / firmaImage.width, maxHeight / firmaImage.height);
      const firmaWidth = firmaImage.width * ratio;
      const firmaHeight = firmaImage.height * ratio;
      
      page3.drawImage(firmaImage, {
        x: 115,
        y: h3 - 347,
        width: firmaWidth,
        height: firmaHeight,
      });
      
      console.log("✓ Firma añadida al PDF");
    }
  } catch (error) {
    console.log("❌ Error al añadir firma:", error);
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
