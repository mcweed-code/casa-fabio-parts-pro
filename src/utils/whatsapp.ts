import { Pedido } from '@/types';
import { formatearPrecio } from './pricing';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Genera el texto formateado del pedido para enviar por WhatsApp
 */
export function generarTextoWhatsApp(pedido: Pedido): string {
  const fecha = format(new Date(pedido.fecha), "dd/MM/yyyy HH:mm", { locale: es });
  
  let texto = `*PEDIDO - CASA FABIO*\n`;
  texto += `━━━━━━━━━━━━━━━━━━\n\n`;
  texto += `*Fecha:* ${fecha}\n\n`;
  texto += `*DETALLE DEL PEDIDO*\n`;
  texto += `━━━━━━━━━━━━━━━━━━\n\n`;

  pedido.items.forEach((item, index) => {
    texto += `${index + 1}. *${item.producto.codigo}*\n`;
    texto += `   ${item.producto.descripcion}\n`;
    texto += `   Cant: ${item.cantidad} | `;
    texto += `Ganancia: ${item.coeficientePorcentaje}% | `;
    texto += `P.Unit: ${formatearPrecio(item.precioUnitarioFinal)}\n`;
    texto += `   *Subtotal: ${formatearPrecio(item.subtotal)}*\n\n`;
  });

  texto += `━━━━━━━━━━━━━━━━━━\n`;
  texto += `*TOTAL: ${formatearPrecio(pedido.total)}*\n`;
  texto += `━━━━━━━━━━━━━━━━━━\n\n`;
  texto += `_Distribuidora Casa Fabio - Autopartes_`;

  return texto;
}

/**
 * Abre WhatsApp Web con el mensaje del pedido
 */
export function enviarPorWhatsApp(pedido: Pedido, numeroTelefono?: string): void {
  const texto = generarTextoWhatsApp(pedido);
  const textoEncoded = encodeURIComponent(texto);
  
  // Si se proporciona número, usar formato con número
  // Si no, usar URL genérica que abre WhatsApp para seleccionar contacto
  const url = numeroTelefono
    ? `https://wa.me/${numeroTelefono}?text=${textoEncoded}`
    : `https://wa.me/?text=${textoEncoded}`;
  
  window.open(url, '_blank');
}
