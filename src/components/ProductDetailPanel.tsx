import { useState } from 'react';
import { Package, Minus, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAppStore } from '@/store/useAppStore';
import { formatearPrecio, calcularPrecioFinal, calcularSubtotal } from '@/utils/pricing';

const PORCENTAJES_DISPONIBLES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

export function ProductDetailPanel() {
  const { 
    productoSeleccionado, 
    pedidoActual, 
    agregarItemPedido,
    eliminarItemPedido,
    mostrarCostos,
    toggleMostrarCostos
  } = useAppStore();

  const [cantidad, setCantidad] = useState(1);
  const [porcentaje, setPorcentaje] = useState(25);

  // Verificar si el producto está en el pedido
  const itemEnPedido = productoSeleccionado
    ? pedidoActual.items.find((item) => item.producto.codigo === productoSeleccionado.codigo)
    : null;

  // Calcular precio final y subtotal
  const precioFinal = productoSeleccionado
    ? calcularPrecioFinal(productoSeleccionado.precioLista, porcentaje)
    : 0;
  const subtotal = calcularSubtotal(precioFinal, cantidad);

  const handleAgregarOActualizar = () => {
    if (!productoSeleccionado) return;
    agregarItemPedido(productoSeleccionado, cantidad, porcentaje);
  };

  const handleEliminar = () => {
    if (!productoSeleccionado) return;
    eliminarItemPedido(productoSeleccionado.codigo);
  };

  if (!productoSeleccionado) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <Package className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">Seleccioná un producto de la lista</p>
        <p className="text-sm mt-2">para ver el detalle completo</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Imagen */}
      <div className="aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
        {productoSeleccionado.imagenUrl ? (
          <img
            src={productoSeleccionado.imagenUrl}
            alt={productoSeleccionado.descripcion}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-20 w-20 text-muted-foreground opacity-30" />
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 p-6 space-y-6">
        {/* Info básica */}
        <div>
          <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full mb-3">
            {productoSeleccionado.categoria}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {productoSeleccionado.descripcion}
          </h2>
          <p className="text-muted-foreground">
            Código: <span className="font-mono font-medium text-foreground">{productoSeleccionado.codigo}</span>
          </p>
        </div>

        {/* Detalles técnicos */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Marca</p>
            <p className="font-medium">{productoSeleccionado.marca}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Subcategoría</p>
            <p className="font-medium">{productoSeleccionado.subcategoria}</p>
          </div>
        </div>

        {/* Toggle costos */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMostrarCostos}
            className="gap-2 text-xs"
          >
            {mostrarCostos ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {mostrarCostos ? 'Ocultar costos' : 'Mostrar costos'}
          </Button>
        </div>

        {/* Precios */}
        <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
          {mostrarCostos && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Precio costo</span>
                <span className="font-medium">{formatearPrecio(productoSeleccionado.precioCosto)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Precio lista</span>
                <span className="font-medium">{formatearPrecio(productoSeleccionado.precioLista)}</span>
              </div>
              <div className="h-px bg-border" />
            </>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Precio final</span>
            <span className="text-lg font-bold text-accent">{formatearPrecio(precioFinal)}</span>
          </div>
        </div>

        {/* Controles - Cantidad y Porcentaje compactos */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Cantidad */}
            <div>
              <Label htmlFor="cantidad" className="text-xs font-semibold mb-1.5 block">
                Cantidad
              </Label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center font-semibold h-8 w-14"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCantidad(cantidad + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Porcentaje */}
            <div>
              <Label htmlFor="porcentaje" className="text-xs font-semibold mb-1.5 block">
                Ganancia
              </Label>
              <Select value={porcentaje.toString()} onValueChange={(v) => setPorcentaje(parseInt(v))}>
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PORCENTAJES_DISPONIBLES.map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subtotal */}
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Subtotal</span>
              <span className="text-xl font-bold text-accent">{formatearPrecio(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción - en la misma línea */}
        <div className="flex gap-2">
          <Button
            onClick={handleAgregarOActualizar}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow-accent"
            size="lg"
          >
            {itemEnPedido ? 'Actualizar' : 'Agregar'}
          </Button>

          {itemEnPedido && (
            <Button
              onClick={handleEliminar}
              variant="outline"
              size="lg"
              className="w-auto px-4"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Estado en pedido */}
        {itemEnPedido && (
          <div className="p-3 bg-accent/10 rounded-lg text-sm">
            <p className="font-medium text-accent mb-1">✓ Producto en el pedido</p>
            <p className="text-muted-foreground">
              Cantidad actual: {itemEnPedido.cantidad} × {formatearPrecio(itemEnPedido.precioUnitarioFinal)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
