import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProductTable } from '@/components/ProductTable';
import { ProductDetailPanel } from '@/components/ProductDetailPanel';
import { OrderSummary } from '@/components/OrderSummary';
import { useAppStore } from '@/store/useAppStore';
import { mockCatalog } from '@/services/catalogService';

const Index = () => {
  const { productos, setCatalogo, theme } = useAppStore();

  // Cargar catálogo inicial y aplicar tema
  useEffect(() => {
    // Aplicar tema inicial
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Cargar catálogo si está vacío
    if (productos.length === 0) {
      setCatalogo(mockCatalog);
    }
  }, [theme, productos.length, setCatalogo]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Layout principal: 3 columnas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna 1: Tabla de productos */}
        <div className="w-[40%] border-r border-border">
          <ProductTable />
        </div>

        {/* Columna 2: Panel de detalle (FIJO) */}
        <div className="w-[35%] border-r border-border">
          <ProductDetailPanel />
        </div>

        {/* Columna 3: Resumen del pedido */}
        <div className="w-[25%]">
          <OrderSummary />
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Área oculta para impresión */}
      <div id="print-area" className="hidden print:block p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">CASA FABIO</h1>
              <p className="text-muted-foreground">Distribuidora de Autopartes</p>
            </div>
            <div className="text-right text-sm">
              <p>Fecha: {new Date().toLocaleDateString('es-AR')}</p>
              <p>Pedido ID: {useAppStore.getState().pedidoActual.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-muted/20 rounded">
            <p><strong>Cliente:</strong> {useAppStore.getState().pedidoActual.clienteNombre || 'Sin especificar'}</p>
            {useAppStore.getState().pedidoActual.observaciones && (
              <p className="mt-2"><strong>Observaciones:</strong> {useAppStore.getState().pedidoActual.observaciones}</p>
            )}
            <p className="mt-2"><strong>Coeficiente:</strong> {useAppStore.getState().pedidoActual.coeficienteGlobal.toFixed(2)}</p>
          </div>

          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="text-left py-2 px-2">Código</th>
                <th className="text-left py-2 px-2">Descripción</th>
                <th className="text-center py-2 px-2">Cant.</th>
                <th className="text-right py-2 px-2">P. Unit.</th>
                <th className="text-right py-2 px-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {useAppStore.getState().pedidoActual.items.map((item) => (
                <tr key={item.producto.codigo} className="border-b border-muted">
                  <td className="py-2 px-2 font-mono text-sm">{item.producto.codigo}</td>
                  <td className="py-2 px-2 text-sm">{item.producto.descripcion}</td>
                  <td className="py-2 px-2 text-center">{item.cantidad}</td>
                  <td className="py-2 px-2 text-right">${item.precioUnitarioFinal.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right font-semibold">${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 p-4 bg-muted/20 rounded">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>TOTAL:</span>
                <span>${useAppStore.getState().pedidoActual.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
