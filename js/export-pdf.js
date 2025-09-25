// PDFLib debe estar incluido como <script src="lib/pdf-lib.min.js"></script> en el HTML
const { PDFDocument } = window.PDFLib;

document.getElementById('form-datos-paciente').addEventListener('submit', async (e) => {
  e.preventDefault();
  

  const formData = new FormData(e.target);
  const nombreApellidos = formData.get('nombre-apellidos');
  const dni = formData.get('dni');
  const fechaNacimiento = formData.get('fecha-nacimiento');
  const telefono = formData.get('telefono');
  const direccion = formData.get('direccion');
  const lugar = formData.get('lugar');
  const dia = formData.get('dia');
  const mes = formData.get('mes');
  const anio = formData.get('anio');
  const firma = formData.get('firma');
  const fecha = formData.get('fecha');

  // Cargar plantilla PDF
  const existingPdfBytes = await fetch('formulario.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Acceder a los campos del formulario PDF
  const form = pdfDoc.getForm();
  form.getTextField('nombre-apellidos').setText(nombreApellidos || '');
  form.getTextField('dni').setText(dni || '');
  form.getTextField('fecha-nacimiento').setText(fechaNacimiento || '');
  form.getTextField('telefono').setText(telefono || '');
  form.getTextField('direccion').setText(direccion || '');
  form.getTextField('lugar').setText(lugar || '');
  form.getTextField('dia').setText(dia || '');
  form.getTextField('mes').setText(mes || '');
  form.getTextField('anio').setText(anio || '');
  form.getTextField('firma').setText(firma || '');
  form.getTextField('fecha').setText(fecha || '');

  // Serializar PDF
  const pdfBytes = await pdfDoc.save();

  // Descargar
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "resultado.pdf";
  a.click();
});