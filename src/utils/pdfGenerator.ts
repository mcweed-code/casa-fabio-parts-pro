import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pedido } from '@/types';
import { formatearPrecioARS } from './coefficients';

interface ClientInfo {
  razon_social: string;
  cuit_dni: string;
  email: string;
  whatsapp: string;
  direccion?: string | null;
}

/**
 * Genera un PDF del pedido
 */
export function generarPdfPedido(pedido: Pedido, clientInfo: ClientInfo): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CASA FABIO', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Distribuidora de Autopartes', pageWidth / 2, 28, { align: 'center' });
  
  // Divider
  doc.setLineWidth(0.5);
  doc.line(14, 35, pageWidth - 14, 35);
  
  // Order info
  doc.setFontSize(10);
  const fecha = new Date(pedido.fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  doc.text(`Fecha: ${fecha}`, 14, 45);
  doc.text(`Pedido #: ${pedido.id.slice(0, 8).toUpperCase()}`, pageWidth - 14, 45, { align: 'right' });
  
  // Client info box
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 50, pageWidth - 28, 28, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', 18, 58);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Razón Social: ${clientInfo.razon_social}`, 18, 65);
  doc.text(`CUIT/DNI: ${clientInfo.cuit_dni}`, 18, 71);
  doc.text(`Email: ${clientInfo.email}`, pageWidth / 2, 65);
  doc.text(`WhatsApp: ${clientInfo.whatsapp}`, pageWidth / 2, 71);
  if (clientInfo.direccion) {
    doc.text(`Dirección: ${clientInfo.direccion}`, 18, 77);
  }
  
  // Products table
  const tableData = pedido.items.map((item, index) => [
    (index + 1).toString(),
    item.producto.codigo,
    item.producto.descripcion.substring(0, 40) + (item.producto.descripcion.length > 40 ? '...' : ''),
    item.cantidad.toString(),
    formatearPrecioARS(item.precioUnitarioFinal),
    formatearPrecioARS(item.subtotal),
  ]);
  
  autoTable(doc, {
    startY: 85,
    head: [['#', 'Código', 'Descripción', 'Cant.', 'P. Unit.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [50, 50, 50],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(50, 50, 50);
  doc.rect(pageWidth - 80, finalY, 66, 12, 'F');
  
  doc.setTextColor(255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - 76, finalY + 8);
  doc.text(formatearPrecioARS(pedido.total), pageWidth - 18, finalY + 8, { align: 'right' });
  
  // Footer
  doc.setTextColor(0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.text('Este documento es un comprobante de pedido - Casa Fabio Distribuidora de Autopartes', pageWidth / 2, footerY, { align: 'center' });
  
  return doc;
}

/**
 * Genera el PDF y lo devuelve como Blob
 */
export function generarPdfBlob(pedido: Pedido, clientInfo: ClientInfo): Blob {
  const doc = generarPdfPedido(pedido, clientInfo);
  return doc.output('blob');
}

/**
 * Descarga el PDF localmente
 */
export function descargarPdf(pedido: Pedido, clientInfo: ClientInfo): void {
  const doc = generarPdfPedido(pedido, clientInfo);
  const fecha = new Date().toISOString().split('T')[0];
  doc.save(`pedido-${pedido.id.slice(0, 8)}-${fecha}.pdf`);
}
