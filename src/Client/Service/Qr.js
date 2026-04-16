/**
 * Servicio para gestionar la lógica de códigos QR en Happy Pets
 */
export const generateQRUrl = (factura) => {
  if (!factura || !factura.url_docx) {
    console.error("La factura no tiene una URL de documento válida.");
    return null;
  }
  // Retornamos la URL directamente del JSON (DevTunnel)
  return factura.url_docx;
};

export const formatFileName = (factura) => {
  return `QR_Factura_${factura.numero_factura}.png`;
};