import { useState } from 'react';
import { 
  Trash2, 
  Send, 
  Save, 
  FileText, 
  Edit2,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppStore } from '@/store/useAppStore';
import { formatearPrecio } from '@/utils/pricing';
import { enviarPorWhatsApp } from '@/utils/whatsapp';
import { useToast } from '@/hooks/use-toast';

export function OrderSummary() {
  const {
    pedidoActual,
    actualizarItemPedido,
    eliminarItemPedido,
    vaciarPedido,
    guardarPedido,
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
    <div className="flex flex-col h-full bg-card border-t border-border overflow-hidden">
      {/* Header compacto */}
      <div className="px-3 py-2 border-b border-border bg-card/80 shrink-0">
        <h2 className="text-sm font-bold">Pedido Actual</h2>
      </div>

      {/* Items del pedido - scroll horizontal si hay muchos */}
      <div className="flex-1 overflow-auto p-2 min-h-0">
        {pedidoActual.items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <FileText className="h-8 w-8 mx-auto mb-1 opacity-30" />
              <p className="text-xs">Pedido vacío</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pedidoActual.items.map((item) => (
              <div
                key={item.producto.codigo}
                className="p-2 bg-muted/50 rounded border border-border min-w-[180px] max-w-[220px]"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-semibold text-accent truncate">
                      {item.producto.codigo}
                    </p>
                    <p className="text-xs font-medium truncate" title={item.producto.descripcion}>
                      {item.producto.descripcion}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={() => eliminarItemPedido(item.producto.codigo)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {editandoItem === item.producto.codigo ? (
                  <div className="mt-2 space-y-1">
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
                        className="h-6 text-xs"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-5 text-xs"
                      onClick={() => setEditandoItem(null)}
                    >
                      Listo
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      {item.cantidad} × {formatearPrecio(item.precioUnitarioFinal)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => setEditandoItem(item.producto.codigo)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <p className="font-bold text-accent text-xs">
                        {formatearPrecio(item.subtotal)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total y acciones compactas */}
      <div className="border-t border-border bg-card/80 shrink-0">
        <div className="px-3 py-2 bg-accent/10 flex justify-between items-center">
          <span className="text-sm font-bold">TOTAL</span>
          <span className="text-lg font-bold text-accent">
            {formatearPrecio(pedidoActual.total)}
          </span>
        </div>

        <div className="p-2 flex gap-2">
          <Button
            onClick={handleEnviarWhatsApp}
            className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white h-8 text-xs"
            disabled={pedidoActual.items.length === 0}
          >
            <Send className="h-3 w-3 mr-1" />
            WhatsApp
          </Button>

          <Button
            onClick={handleGuardarPedido}
            variant="outline"
            className="h-8 px-3"
            disabled={pedidoActual.items.length === 0}
          >
            <Save className="h-3 w-3" />
          </Button>

          <Button
            onClick={handleImprimir}
            variant="outline"
            className="h-8 px-3"
            disabled={pedidoActual.items.length === 0}
          >
            <FileText className="h-3 w-3" />
          </Button>

          <Button
            onClick={vaciarPedido}
            variant="outline"
            className="h-8 px-3 text-destructive hover:bg-destructive/10"
            disabled={pedidoActual.items.length === 0}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
