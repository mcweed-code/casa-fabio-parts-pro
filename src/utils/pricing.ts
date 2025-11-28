/**
 * Utilidades para cálculo de precios con coeficientes
 */

/**
 * Calcula el precio final aplicando un coeficiente al precio base
 * @param precioBase - Precio de lista del producto
 * @param coeficiente - Multiplicador a aplicar
 * @returns Precio final calculado
 */
export function calcularPrecioFinal(precioBase: number, coeficiente: number): number {
  return precioBase * coeficiente;
}

/**
 * Calcula el subtotal de un ítem del pedido
 * @param precioUnitario - Precio unitario final
 * @param cantidad - Cantidad de unidades
 * @returns Subtotal calculado
 */
export function calcularSubtotal(precioUnitario: number, cantidad: number): number {
  return precioUnitario * cantidad;
}

/**
 * Formatea un número como precio (moneda argentina)
 */
export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(precio);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatearNumero(numero: number): string {
  return new Intl.NumberFormat('es-AR').format(numero);
}
