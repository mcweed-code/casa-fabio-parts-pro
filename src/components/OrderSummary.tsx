import { useState } from 'react';
import { 
  Trash2, 
  Send, 
  Save, 
  FileText, 
  Edit2,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppStore } from '@/store/useAppStore';
import { formatearPrecio } from '@/utils/pricing';
import { enviarPorWhatsApp } from '@/utils/whatsapp';
import { useToast } from '@/hooks/use-toast';

interface OrderSummaryProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function OrderSummary({ isExpanded, onToggle }: OrderSummaryProps) {
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
      {/* Header con toggle - siempre visible */}
      <div 
        className="px-3 py-1.5 border-b border-border bg-card/80 shrink-0 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold">Pedido</h2>
          <span className="text-xs text-muted-foreground">
            {pedidoActual.items.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-accent">
            {formatearPrecio(pedidoActual.total)}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <>
          {/* Items del pedido */}
          <div className="flex-1 overflow-auto p-2 min-h-0">
            {pedidoActual.items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <FileText className="h-6 w-6 mx-auto mb-1 opacity-30" />
                  <p className="text-xs">Pedido vacío</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {pedidoActual.items.map((item) => (
                  <div
                    key={item.producto.codigo}
                    className="p-1.5 bg-muted/50 rounded border border-border min-w-[160px] max-w-[180px]"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[10px] font-semibold text-accent truncate">
                          {item.producto.codigo}
                        </p>
                        <p className="text-[10px] font-medium truncate" title={item.producto.descripcion}>
                          {item.producto.descripcion}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarItemPedido(item.producto.codigo);
                        }}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </div>

                    {editandoItem === item.producto.codigo ? (
                      <div className="mt-1 space-y-1">
                        <div>
                          <Label className="text-[10px]">Cantidad</Label>
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
                            className="h-5 text-[10px]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-4 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditandoItem(null);
                          }}
                        >
                          Listo
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/50">
                        <div className="text-[10px] text-muted-foreground">
                          {item.cantidad} × {formatearPrecio(item.precioUnitarioFinal)}
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditandoItem(item.producto.codigo);
                            }}
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </Button>
                          <p className="font-bold text-accent text-[10px]">
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

          {/* Botones de acción compactos */}
          <div className="border-t border-border bg-card/80 shrink-0 p-1.5 flex items-center gap-1.5">
            <Button
              onClick={handleEnviarWhatsApp}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white h-7 px-3 text-xs"
              disabled={pedidoActual.items.length === 0}
            >
              <Send className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>

            <Button
              onClick={handleGuardarPedido}
              variant="outline"
              className="h-7 px-2"
              disabled={pedidoActual.items.length === 0}
              title="Guardar"
            >
              <Save className="h-3 w-3" />
            </Button>

            <Button
              onClick={handleImprimir}
              variant="outline"
              className="h-7 px-2"
              disabled={pedidoActual.items.length === 0}
              title="Imprimir"
            >
              <FileText className="h-3 w-3" />
            </Button>

            <div className="flex-1" />

            <Button
              onClick={vaciarPedido}
              variant="outline"
              className="h-7 px-2 text-destructive hover:bg-destructive/10"
              disabled={pedidoActual.items.length === 0}
              title="Vaciar pedido"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
