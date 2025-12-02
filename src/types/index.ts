/**
 * Modelo de datos para Casa Fabio - Distribuidora de Autopartes
 */

export interface Producto {
  codigo: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  precioCosto: number;
  precioLista: number;
  imagenUrl?: string;
}

export interface ItemPedido {
  producto: Producto;
  cantidad: number;
  coeficientePorcentaje: number; // 25, 50, 75, etc. (sin el %)
  precioUnitarioFinal: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  items: ItemPedido[];
  total: number;
  fecha: string;
}

export type Categoria = 
  | 'Iluminación' 
  | 'Frenos' 
  | 'Suspensión' 
  | 'Motor' 
  | 'Transmisión'
  | 'Accesorios'
  | 'Eléctrico'
  | 'Filtros'
  | 'Refrigeración'
  | 'Todas';
