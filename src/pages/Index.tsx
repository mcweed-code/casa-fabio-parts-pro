import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ProductTable } from '@/components/ProductTable';
import { ProductDetailPanel } from '@/components/ProductDetailPanel';
import { OrderSummary } from '@/components/OrderSummary';
import { useAppStore } from '@/store/useAppStore';
import { mockCatalog, catalogService } from '@/services/catalogService';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

const Index = () => {
  const { productos, setCatalogo, theme, setCatalogoLoading } = useAppStore();
  const [orderExpanded, setOrderExpanded] = useState(false);

  // Cargar catálogo inicial, aplicar tema y configurar auto-refresh
  useEffect(() => {
    // Aplicar tema inicial
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Cargar catálogo si está vacío
    if (productos.length === 0) {
      setCatalogo(mockCatalog);
    }

    // Auto-refresh del catálogo cada 5 minutos
    const interval = setInterval(async () => {
      try {
        setCatalogoLoading(true);
        // En producción, usar: const productos = await catalogService.fetchCatalogWithRetry();
        const productos = mockCatalog;
        setCatalogo(productos);
      } catch (error) {
        console.error('Error al actualizar catálogo automáticamente', error);
      } finally {
        setCatalogoLoading(false);
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [theme, productos.length, setCatalogo, setCatalogoLoading]);

  return (
    <div className="h-screen max-h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      
      {/* Layout adaptable */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Parte superior: Catálogo (tabla y detalle) */}
        <div className={`flex border-b border-border min-h-0 transition-all duration-300 ${orderExpanded ? 'flex-[55]' : 'flex-1'}`}>
          {/* Tabla de productos - más ancha cuando pedido está colapsado */}
          <div className={`border-r border-border overflow-hidden transition-all duration-300 ${orderExpanded ? 'w-[55%]' : 'w-[60%]'}`}>
            <ProductTable />
          </div>

          {/* Panel de detalle */}
          <div className={`overflow-hidden transition-all duration-300 ${orderExpanded ? 'w-[45%]' : 'w-[40%]'}`}>
            <ProductDetailPanel />
          </div>
        </div>

        {/* Parte inferior: Pedido (colapsable) */}
        <div className={`shrink-0 transition-all duration-300 ${orderExpanded ? 'flex-[45] min-h-[120px]' : 'h-auto'}`}>
          <OrderSummary 
            isExpanded={orderExpanded} 
            onToggle={() => setOrderExpanded(!orderExpanded)} 
          />
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
            <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-AR')}</p>
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
