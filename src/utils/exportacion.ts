/**
 * Utilidades para exportar datos a Excel
 */

import { Producto } from '@/types';
import { calcularPrecioFinal } from '@/utils/pricing';
import * as XLSX from 'xlsx';

/**
 * Genera y descarga un archivo Excel con la lista de productos
 * Incluye precio con ganancia aplicada
 */
export function descargarExcelProductos(productos: Producto[], nombreArchivo: string, porcentajeGanancia: number = 25) {
  const datos = productos.map(p => ({
    'Código': p.codigo,
    'Descripción': p.descripcion,
    'Categoría': p.categoria,
    'Subcategoría': p.subcategoria,
    'Marca': p.marca,
    'Precio Lista': p.precioCosto,
    'Ganancia (%)': porcentajeGanancia,
    'Precio Venta': calcularPrecioFinal(p.precioCosto, porcentajeGanancia)
  }));

  const worksheet = XLSX.utils.json_to_sheet(datos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Precios');
  
  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 15 }, // Código
    { wch: 40 }, // Descripción
    { wch: 15 }, // Categoría
    { wch: 15 }, // Subcategoría
    { wch: 15 }, // Marca
    { wch: 15 }, // Precio Lista
    { wch: 12 }, // Ganancia (%)
    { wch: 15 }, // Precio Venta
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, nombreArchivo);
}

// Mantener para compatibilidad si se necesita
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
