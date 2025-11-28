import { Producto } from '@/types';

// URL configurable del JSON del catálogo
// Cambiar esta URL para apuntar al servidor real
const CATALOG_URL = '/api/catalogo.json'; // Ajustar según necesidad

/**
 * Servicio para obtener el catálogo de productos desde un JSON remoto
 */
export const catalogService = {
  /**
   * Obtiene el catálogo completo desde el servidor
   * @returns Promise con array de productos
   */
  async fetchCatalog(): Promise<Producto[]> {
    try {
      const response = await fetch(CATALOG_URL);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validar estructura básica
      if (!Array.isArray(data)) {
        throw new Error('El JSON no contiene un array de productos');
      }
      
      return data;
    } catch (error) {
      console.error('Error al obtener catálogo:', error);
      throw error;
    }
  },

  /**
   * Reintenta obtener el catálogo con backoff exponencial
   */
  async fetchCatalogWithRetry(maxRetries = 3): Promise<Producto[]> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.fetchCatalog();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          // Esperar antes de reintentar (1s, 2s, 4s)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    throw lastError || new Error('Error desconocido al obtener catálogo');
  },
};

/**
 * Mock data para desarrollo/testing
 * Simula productos de una distribuidora de autopartes
 */
export const mockCatalog: Producto[] = [
  {
    codigo: 'FAR-001',
    descripcion: 'Faro Delantero Derecho Universal LED',
    categoria: 'Iluminación',
    subcategoria: 'Faros',
    marca: 'Osram',
    precioCosto: 15000,
    precioLista: 22500,
    imagenUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
  },
  {
    codigo: 'FAR-002',
    descripcion: 'Faro Delantero Izquierdo Universal LED',
    categoria: 'Iluminación',
    subcategoria: 'Faros',
    marca: 'Osram',
    precioCosto: 15000,
    precioLista: 22500,
    imagenUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
  },
  {
    codigo: 'PAS-101',
    descripcion: 'Pastillas de Freno Delanteras Cerámicas',
    categoria: 'Frenos',
    subcategoria: 'Pastillas',
    marca: 'Brembo',
    precioCosto: 8500,
    precioLista: 13500,
  },
  {
    codigo: 'PAS-102',
    descripcion: 'Pastillas de Freno Traseras Cerámicas',
    categoria: 'Frenos',
    subcategoria: 'Pastillas',
    marca: 'Brembo',
    precioCosto: 7500,
    precioLista: 12000,
  },
  {
    codigo: 'DIS-201',
    descripcion: 'Disco de Freno Ventilado 280mm',
    categoria: 'Frenos',
    subcategoria: 'Discos',
    marca: 'Brembo',
    precioCosto: 12000,
    precioLista: 18500,
  },
  {
    codigo: 'AMO-301',
    descripcion: 'Amortiguador Delantero Gas Premium',
    categoria: 'Suspensión',
    subcategoria: 'Amortiguadores',
    marca: 'Monroe',
    precioCosto: 18000,
    precioLista: 27500,
  },
  {
    codigo: 'AMO-302',
    descripcion: 'Amortiguador Trasero Gas Premium',
    categoria: 'Suspensión',
    subcategoria: 'Amortiguadores',
    marca: 'Monroe',
    precioCosto: 16500,
    precioLista: 25000,
  },
  {
    codigo: 'FIL-401',
    descripcion: 'Filtro de Aceite Universal Premium',
    categoria: 'Filtros',
    subcategoria: 'Aceite',
    marca: 'Mann',
    precioCosto: 2800,
    precioLista: 4500,
  },
  {
    codigo: 'FIL-402',
    descripcion: 'Filtro de Aire Universal Sport',
    categoria: 'Filtros',
    subcategoria: 'Aire',
    marca: 'K&N',
    precioCosto: 5500,
    precioLista: 8500,
  },
  {
    codigo: 'FIL-403',
    descripcion: 'Filtro de Combustible Universal',
    categoria: 'Filtros',
    subcategoria: 'Combustible',
    marca: 'Mann',
    precioCosto: 3200,
    precioLista: 5000,
  },
  {
    codigo: 'BAT-501',
    descripcion: 'Batería 12V 75Ah Libre Mantenimiento',
    categoria: 'Eléctrico',
    subcategoria: 'Baterías',
    marca: 'Bosch',
    precioCosto: 35000,
    precioLista: 52500,
  },
  {
    codigo: 'ALT-601',
    descripcion: 'Alternador 12V 90A Remanufacturado',
    categoria: 'Eléctrico',
    subcategoria: 'Alternadores',
    marca: 'Valeo',
    precioCosto: 22000,
    precioLista: 33500,
  },
  {
    codigo: 'BUJ-701',
    descripcion: 'Juego Bujías Iridium x4',
    categoria: 'Motor',
    subcategoria: 'Bujías',
    marca: 'NGK',
    precioCosto: 8900,
    precioLista: 13500,
  },
  {
    codigo: 'RAD-801',
    descripcion: 'Radiador Aluminio Universal',
    categoria: 'Refrigeración',
    subcategoria: 'Radiadores',
    marca: 'Denso',
    precioCosto: 28000,
    precioLista: 42500,
  },
  {
    codigo: 'LLA-901',
    descripcion: 'Llanta Aleación 16" 5x114.3',
    categoria: 'Accesorios',
    subcategoria: 'Llantas',
    marca: 'OZ Racing',
    precioCosto: 45000,
    precioLista: 68000,
  },
];
