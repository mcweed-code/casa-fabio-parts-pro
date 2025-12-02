/**
 * Utilidades para exportar datos a CSV
 */

import { Producto } from '@/types';
import { formatearPrecio } from './pricing';

/**
 * Convierte un array de productos a formato CSV
 */
export function generarCSVProductos(productos: Producto[]): string {
  const headers = ['Código', 'Descripción', 'Categoría', 'Subcategoría', 'Marca', 'Precio Lista'];
  const rows = productos.map(p => [
    p.codigo,
    p.descripcion,
    p.categoria,
    p.subcategoria,
    p.marca,
    p.precioLista.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Descarga un CSV en el navegador
 */
export function descargarCSV(contenido: string, nombreArchivo: string) {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', nombreArchivo);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
