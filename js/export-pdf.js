function generatePDF() {
  // const form = document.getElementById("form-datos-paciente");
  // html2pdf(form);
    const element = document.getElementById('form-datos-paciente');

  // Genera y descarga el PDF
  html2pdf().set({
    margin: 10,
    filename: 'consentimiento.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(element).save();

}
