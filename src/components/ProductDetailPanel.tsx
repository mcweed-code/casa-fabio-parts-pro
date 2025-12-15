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

  // Precio de lista = precio distribuidor + porcentaje de ganancia
  // El precio distribuidor (precioCosto) es la base, el precioLista se calcula
  const precioDistribuidor = productoSeleccionado?.precioCosto || 0;
  const precioLista = calcularPrecioFinal(precioDistribuidor, porcentaje);
  const subtotal = calcularSubtotal(precioLista, cantidad);

  const handleAgregarOActualizar = () => {
    if (!productoSeleccionado) return;
    // Al agregar al pedido, se suma el precio de costo (distribuidor)
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
      <div className="flex-1 p-4 space-y-4">
        {/* Info básica */}
        <div>
          <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full mb-2">
            {productoSeleccionado.categoria}
          </div>
          <h2 className="text-xl font-bold mb-1">
            {productoSeleccionado.descripcion}
          </h2>
          <p className="text-muted-foreground text-sm">
            Código: <span className="font-mono font-medium text-foreground">{productoSeleccionado.codigo}</span>
          </p>
        </div>

        {/* Detalles técnicos */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Marca</p>
            <p className="font-medium text-sm">{productoSeleccionado.marca}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Subcategoría</p>
            <p className="font-medium text-sm">{productoSeleccionado.subcategoria}</p>
          </div>
        </div>

        {/* Toggle costos + Precios */}
        <div className="space-y-2 p-3 bg-card border border-border rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Precio</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMostrarCostos}
              className="gap-1 text-xs h-7 px-2"
            >
              {mostrarCostos ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {mostrarCostos ? 'Ocultar costo' : 'Ver costo'}
            </Button>
          </div>
          
          {mostrarCostos && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">P. Distribuidor</span>
              <span className="font-medium">{formatearPrecio(precioDistribuidor)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Precio Lista (+{porcentaje}%)</span>
            <span className="text-lg font-bold text-accent">{formatearPrecio(precioLista)}</span>
          </div>
        </div>

        {/* Controles - Cantidad y Porcentaje compactos en una línea */}
        <div className="grid grid-cols-2 gap-2">
          {/* Cantidad */}
          <div>
            <Label htmlFor="cantidad" className="text-xs font-semibold mb-1 block">
              Cant.
            </Label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
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
                className="text-center font-semibold h-7 w-12 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCantidad(cantidad + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Porcentaje */}
          <div>
            <Label htmlFor="porcentaje" className="text-xs font-semibold mb-1 block">
              Ganancia
            </Label>
            <Select value={porcentaje.toString()} onValueChange={(v) => setPorcentaje(parseInt(v))}>
              <SelectTrigger className="h-7 w-full text-sm">
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
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">Subtotal</span>
            <span className="text-lg font-bold text-accent">{formatearPrecio(subtotal)}</span>
          </div>
        </div>

        {/* Botones de acción - en la misma línea */}
        <div className="flex gap-2">
          <Button
            onClick={handleAgregarOActualizar}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow-accent h-9"
          >
            {itemEnPedido ? 'Actualizar' : 'Agregar'}
          </Button>

          {itemEnPedido && (
            <Button
              onClick={handleEliminar}
              variant="outline"
              className="w-auto px-3 h-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Estado en pedido */}
        {itemEnPedido && (
          <div className="p-2 bg-accent/10 rounded-lg text-xs">
            <p className="font-medium text-accent">✓ En pedido</p>
            <p className="text-muted-foreground">
              {itemEnPedido.cantidad} × {formatearPrecio(itemEnPedido.precioUnitarioFinal)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
