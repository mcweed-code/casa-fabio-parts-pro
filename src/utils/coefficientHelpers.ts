/**
 * Helpers centralizados para manejo de coeficientes
 * Los coeficientes se guardan como porcentaje (ej: 30 = 30%)
 * Para cálculos se convierten a factor (ej: 30 => 1.30)
 */

interface CoefficientData {
  mode: 'general' | 'by_subcategory';
  general_coef: number; // Guardado como porcentaje (30 = 30%)
  subcategory_coefs: Record<string, number>; // Guardados como porcentaje
}

/**
 * Parsea un input de porcentaje y devuelve el número
 * Acepta: "30", "30%", " 30.5 ", 30
 * Devuelve: 30.5 (número limpio)
 */
export function parsePercent(input: string | number): number {
  if (typeof input === 'number') return input;
  const cleaned = String(input).replace('%', '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convierte porcentaje a factor multiplicador
 * Ej: 30 => 1.30, 25 => 1.25, 50 => 1.50
 */
export function percentToFactor(percent: number): number {
  return 1 + (percent / 100);
}

/**
 * Convierte factor a porcentaje
 * Ej: 1.30 => 30, 1.25 => 25
 */
export function factorToPercent(factor: number): number {
  return (factor - 1) * 100;
}

/**
 * Obtiene el porcentaje efectivo para una subcategoría
 * Si está en modo 'by_subcategory' y existe el coef, lo usa
 * Si no, usa el general
 */
export function getEffectivePercent(
  coefficients: CoefficientData | null,
  subcategory: string
): number {
  if (!coefficients) {
    return 25; // Default 25%
  }

  if (coefficients.mode === 'by_subcategory' && coefficients.subcategory_coefs) {
    const subcatCoef = coefficients.subcategory_coefs[subcategory];
    if (typeof subcatCoef === 'number') {
      return subcatCoef;
    }
  }

  return Number(coefficients.general_coef) || 25;
}

/**
 * Obtiene el factor multiplicador efectivo para una subcategoría
 * Combina getEffectivePercent + percentToFactor
 */
export function getEffectiveFactor(
  coefficients: CoefficientData | null,
  subcategory: string
): number {
  const percent = getEffectivePercent(coefficients, subcategory);
  return percentToFactor(percent);
}

/**
 * Calcula el precio de venta aplicando el coeficiente
 */
export function calcularPrecioVenta(precioBase: number, factor: number): number {
  return precioBase * factor;
}

/**
 * Formatea un número como precio ARS
 */
export function formatearPrecioARS(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(precio);
}
