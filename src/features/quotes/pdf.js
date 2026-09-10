import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Rasterizes an already-laid-out DOM node (e.g. a `QuoteDocument` instance)
 * and paginates it into an A4 PDF, then triggers a browser download.
 */
export async function downloadNodeAsPdf(node, filename = 'documento.pdf') {
  if (!node) throw new Error('Nada que exportar');

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/png');

  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
