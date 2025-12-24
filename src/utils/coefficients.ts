/**
 * Utilidades para cálculo con coeficientes de usuario
 */

interface Coefficients {
  mode: 'general' | 'by_category';
  general_coef: number;
  category_coefs: Record<string, number>;
}

/**
 * Obtiene el coeficiente efectivo para una categoría
 * @param coefficients - Configuración de coeficientes del usuario
 * @param category - Categoría del producto
 * @returns Coeficiente a aplicar
 */
export function getEffectiveCoef(
  coefficients: Coefficients | null,
  category: string
): number {
  if (!coefficients) {
    return 1.25; // Default 25% de ganancia
  }

  if (coefficients.mode === 'by_category' && coefficients.category_coefs[category]) {
    return coefficients.category_coefs[category];
  }

  return Number(coefficients.general_coef) || 1.25;
}

/**
 * Calcula el precio de venta aplicando el coeficiente
 * @param precioBase - Precio base/costo del producto
 * @param coeficiente - Coeficiente a aplicar (ej: 1.25 = 25% ganancia)
 * @returns Precio de venta calculado
 */
export function calcularPrecioVenta(precioBase: number, coeficiente: number): number {
  return precioBase * coeficiente;
}

/**
 * Formatea un número como precio (moneda argentina)
 */
export function formatearPrecioARS(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(precio);
}
