import { useState } from 'react';
import { Package, Minus, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAppStore } from '@/store/useAppStore';
import { formatearPrecio, calcularPrecioFinal } from '@/utils/pricing';
import { ImageLightbox } from './ImageLightbox';
import { setTableCategory, setTableCategoryAndSubcategory } from './ProductTable';

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

  const precioLista = productoSeleccionado?.precioCosto || 0;
  const precioVenta = calcularPrecioFinal(precioLista, porcentaje);

  const imagenUrl = productoSeleccionado 
    ? (productoSeleccionado.imagenUrl || `https://casafabio.com.ar/media/${productoSeleccionado.codigo}.jpg`)
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
        <Package className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-xs">Seleccioná un producto</p>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Imagen - 40% */}
      <div className="w-[40%] bg-muted flex items-center justify-center p-2 shrink-0">
        <ImageLightbox
          src={imagenUrl}
          alt={productoSeleccionado.descripcion}
          className="w-full h-full object-contain max-h-full"
          fallback={<Package className="h-12 w-12 text-muted-foreground opacity-30" />}
        />
      </div>

      {/* Info - 60% */}
      <div className="w-[60%] flex flex-col p-2 overflow-y-auto">
        {/* Categorías filtrables */}
        <div className="flex flex-wrap gap-1 mb-1">
          <span 
            className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] font-semibold rounded-full hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
            onClick={() => setTableCategory(productoSeleccionado.categoria)}
          >
            {productoSeleccionado.categoria}
          </span>
          <span 
            className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded-full hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
            onClick={() => setTableCategoryAndSubcategory(productoSeleccionado.categoria, productoSeleccionado.subcategoria)}
          >
            {productoSeleccionado.subcategoria}
          </span>
        </div>

        {/* Título */}
        <h2 className="text-xs font-bold leading-tight mb-0.5 line-clamp-2">
          {productoSeleccionado.descripcion}
        </h2>
        <p className="text-muted-foreground text-[10px] mb-2">
          <span className="font-mono">{productoSeleccionado.codigo}</span> · {productoSeleccionado.marca}
        </p>

        {/* Precios */}
        <div className="p-1.5 bg-card border border-border rounded mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold">Precio</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMostrarCostos}
              className="gap-0.5 text-[10px] h-5 px-1.5"
            >
              {mostrarCostos ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
              {mostrarCostos ? 'Ocultar' : 'Ver'}
            </Button>
          </div>
          
          {mostrarCostos && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground">P. Lista</span>
              <span className="font-medium">{formatearPrecio(precioLista)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">
              Venta {mostrarCostos && `(+${porcentaje}%)`}
            </span>
            <span className="text-sm font-bold text-accent">{formatearPrecio(precioVenta)}</span>
          </div>
        </div>

        {/* Controles en una fila */}
        <div className="flex items-center gap-1.5 mt-auto">
          {/* Cantidad */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            >
              <Minus className="h-2.5 w-2.5" />
            </Button>
            <Input
              type="text"
              inputMode="numeric"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center font-semibold h-6 w-8 text-xs px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCantidad(cantidad + 1)}
            >
              <Plus className="h-2.5 w-2.5" />
            </Button>
          </div>

          {/* Ganancia (solo si mostrarCostos) */}
          {mostrarCostos && (
            <Select value={porcentaje.toString()} onValueChange={(v) => setPorcentaje(parseInt(v))}>
              <SelectTrigger className="h-6 w-14 text-[10px]">
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
          )}

          {/* Botón agregar */}
          <Button
            onClick={handleAgregarOActualizar}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-6 text-[10px]"
          >
            {itemEnPedido ? 'Actualizar' : 'Agregar'}
          </Button>

          {/* Botón eliminar */}
          {itemEnPedido && (
            <Button
              onClick={handleEliminar}
              variant="outline"
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Estado en pedido */}
        {itemEnPedido && (
          <div className="p-1 bg-accent/10 rounded text-[10px] mt-1.5">
            <p className="font-medium text-accent">✓ En pedido: {itemEnPedido.cantidad} × {formatearPrecio(precioLista)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
