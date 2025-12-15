import { useState } from 'react';
import { Package, Minus, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAppStore } from '@/store/useAppStore';
import { formatearPrecio, calcularPrecioFinal } from '@/utils/pricing';
import { ImageLightbox } from './ImageLightbox';

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

  const itemEnPedido = productoSeleccionado
    ? pedidoActual.items.find((item) => item.producto.codigo === productoSeleccionado.codigo)
    : null;

  // Precio de Lista = precio base del producto
  // Precio de Venta = precio de lista + ganancia
  const precioLista = productoSeleccionado?.precioCosto || 0;
  const precioVenta = calcularPrecioFinal(precioLista, porcentaje);

  // URL de imagen desde servidor (usar placeholder de prueba por ahora)
  const imagenUrl = productoSeleccionado 
    ? `https://picsum.photos/seed/${productoSeleccionado.codigo}/200/150`
    : '';

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
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <Package className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">Seleccioná un producto</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Contenido compacto */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Imagen con lightbox - más pequeña */}
        <div className="h-20 w-full bg-muted rounded flex items-center justify-center overflow-hidden shrink-0">
          <ImageLightbox
            src={imagenUrl}
            alt={productoSeleccionado.descripcion}
            className="w-full h-full object-contain"
            fallback={<Package className="h-10 w-10 text-muted-foreground opacity-30" />}
          />
        </div>

        {/* Info básica */}
        <div>
          <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-xs font-semibold rounded-full mb-1">
            {productoSeleccionado.categoria}
          </span>
          <span className="inline-block px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full mb-1 ml-1">
            {productoSeleccionado.subcategoria}
          </span>
          <h2 className="text-sm font-bold leading-tight mb-0.5">
            {productoSeleccionado.descripcion}
          </h2>
          <p className="text-muted-foreground text-xs">
            <span className="font-mono">{productoSeleccionado.codigo}</span> · {productoSeleccionado.marca}
          </p>
        </div>

        {/* Precios */}
        <div className="p-2 bg-card border border-border rounded-lg space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold">Precio</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMostrarCostos}
              className="gap-1 text-xs h-6 px-2"
            >
              {mostrarCostos ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {mostrarCostos ? 'Ocultar' : 'Ver costo'}
            </Button>
          </div>
          
          {mostrarCostos && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">P. Lista</span>
              <span className="font-medium">{formatearPrecio(precioLista)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              P. Venta {mostrarCostos && `(+${porcentaje}%)`}
            </span>
            <span className="text-base font-bold text-accent">{formatearPrecio(precioVenta)}</span>
          </div>
        </div>

        {/* Controles - solo mostrar ganancia si mostrarCostos */}
        <div className="flex items-end gap-2">
          {/* Cantidad */}
          <div className="flex-1">
            <Label className="text-xs font-semibold mb-1 block">Cant.</Label>
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
                type="text"
                inputMode="numeric"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center font-semibold h-7 w-12 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

          {/* Porcentaje - solo visible cuando mostrarCostos */}
          {mostrarCostos && (
            <div>
              <Label className="text-xs font-semibold mb-1 block">Ganancia</Label>
              <Select value={porcentaje.toString()} onValueChange={(v) => setPorcentaje(parseInt(v))}>
                <SelectTrigger className="h-7 w-16 text-xs">
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
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button
            onClick={handleAgregarOActualizar}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-7 text-xs"
          >
            {itemEnPedido ? 'Actualizar' : 'Agregar'}
          </Button>

          {itemEnPedido && (
            <Button
              onClick={handleEliminar}
              variant="outline"
              className="w-auto px-2 h-7"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Estado en pedido */}
        {itemEnPedido && (
          <div className="p-1.5 bg-accent/10 rounded text-xs">
            <p className="font-medium text-accent">✓ En pedido: {itemEnPedido.cantidad} × {formatearPrecio(precioLista)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
