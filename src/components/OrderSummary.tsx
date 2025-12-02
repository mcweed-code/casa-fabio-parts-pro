import { useState } from 'react';
import { 
  Trash2, 
  Send, 
  Save, 
  FileText, 
  Edit2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAppStore } from '@/store/useAppStore';
import { formatearPrecio } from '@/utils/pricing';
import { enviarPorWhatsApp } from '@/utils/whatsapp';
import { useToast } from '@/hooks/use-toast';

const PORCENTAJES_DISPONIBLES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

export function OrderSummary() {
  const {
    pedidoActual,
    actualizarItemPedido,
    eliminarItemPedido,
    vaciarPedido,
    guardarPedido,
    mostrarCostos,
    toggleMostrarCostos,
  } = useAppStore();

  const { toast } = useToast();
  const [editandoItem, setEditandoItem] = useState<string | null>(null);

  const handleGuardarPedido = () => {
    if (pedidoActual.items.length === 0) {
      toast({
        title: 'Pedido vacío',
        description: 'Agregá productos antes de guardar.',
        variant: 'destructive',
      });
      return;
    }

    const pedidoConFecha = {
      ...pedidoActual,
      fecha: new Date().toISOString(),
    };

    guardarPedido(pedidoConFecha);
    toast({
      title: 'Pedido guardado',
      description: 'El pedido se guardó correctamente.',
    });
  };

  const handleEnviarWhatsApp = () => {
    if (pedidoActual.items.length === 0) {
      toast({
        title: 'Pedido vacío',
        description: 'Agregá productos antes de enviar.',
        variant: 'destructive',
      });
      return;
    }

    enviarPorWhatsApp(pedidoActual);
    toast({
      title: 'Abriendo WhatsApp',
      description: 'Se abrió WhatsApp Web con el pedido.',
    });
  };

  const handleImprimir = () => {
    if (pedidoActual.items.length === 0) {
      toast({
        title: 'Pedido vacío',
        description: 'Agregá productos antes de imprimir.',
        variant: 'destructive',
      });
      return;
    }
    
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-card border-t border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/80 flex items-center justify-between">
        <h2 className="text-lg font-bold">Pedido Actual</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMostrarCostos}
          className="gap-2"
        >
          {mostrarCostos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {mostrarCostos ? 'Ocultar costos' : 'Mostrar costos'}
        </Button>
      </div>

      {/* Items del pedido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pedidoActual.items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">El pedido está vacío</p>
            </div>
          </div>
        ) : (
          pedidoActual.items.map((item) => (
            <div
              key={item.producto.codigo}
              className="p-3 bg-muted/50 rounded-lg border border-border space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-semibold text-accent">
                    {item.producto.codigo}
                  </p>
                  <p className="text-sm font-medium truncate">
                    {item.producto.descripcion}
                  </p>
                  {mostrarCostos && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Costo: {formatearPrecio(item.producto.precioCosto)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => eliminarItemPedido(item.producto.codigo)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {editandoItem === item.producto.codigo ? (
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          actualizarItemPedido(
                            item.producto.codigo,
                            parseInt(e.target.value) || 1,
                            item.coeficientePorcentaje
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Ganancia</Label>
                      <Select 
                        value={item.coeficientePorcentaje.toString()} 
                        onValueChange={(v) =>
                          actualizarItemPedido(
                            item.producto.codigo,
                            item.cantidad,
                            parseInt(v)
                          )
                        }
                      >
                        <SelectTrigger className="h-8">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7"
                    onClick={() => setEditandoItem(null)}
                  >
                    Listo
                  </Button>
                </div>
              ) : (
                <div className="flex items-end justify-between pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Cant: {item.cantidad} × {formatearPrecio(item.precioUnitarioFinal)}</p>
                    <p>Ganancia: {item.coeficientePorcentaje}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditandoItem(item.producto.codigo)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <p className="font-bold text-accent">
                      {formatearPrecio(item.subtotal)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Total y acciones */}
      <div className="border-t border-border bg-card/80">
        <div className="p-4 bg-accent/10">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">TOTAL</span>
            <span className="text-2xl font-bold text-accent">
              {formatearPrecio(pedidoActual.total)}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <Button
            onClick={handleEnviarWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
            size="lg"
            disabled={pedidoActual.items.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar por WhatsApp
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleGuardarPedido}
              variant="outline"
              disabled={pedidoActual.items.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>

            <Button
              onClick={handleImprimir}
              variant="outline"
              disabled={pedidoActual.items.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>

          <Button
            onClick={vaciarPedido}
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10"
            disabled={pedidoActual.items.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Vaciar pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
