import { useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProductTable } from '@/components/ProductTable';
import { ProductDetailPanel } from '@/components/ProductDetailPanel';
import { OrderSummary } from '@/components/OrderSummary';
import { useAppStore } from '@/store/useAppStore';
import { mockCatalog, catalogService } from '@/services/catalogService';
import { Producto } from '@/types';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

const Index = () => {
  const { 
    productos, 
    setCatalogo, 
    theme, 
    setCatalogoLoading, 
    catalogoLoading,
    ultimaActualizacion,
    setUltimaActualizacion 
  } = useAppStore();
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [porcentajeGanancia] = useState(25); // Puede hacerse configurable

  // Función para cargar catálogo
  const cargarCatalogo = useCallback(async () => {
    try {
      setCatalogoLoading(true);
      // En producción, usar: const productos = await catalogService.fetchCatalogWithRetry();
      // Simular delay de carga para desarrollo
      await new Promise(resolve => setTimeout(resolve, 500));
      const productosData = mockCatalog;
      setCatalogo(productosData);
      setUltimaActualizacion(new Date().toISOString());
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    } finally {
      setCatalogoLoading(false);
    }
  }, [setCatalogo, setCatalogoLoading, setUltimaActualizacion]);

  // Cargar catálogo inicial y aplicar tema
  useEffect(() => {
    // Aplicar tema inicial
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Cargar catálogo al iniciar si está vacío
    if (productos.length === 0) {
      cargarCatalogo();
    } else {
      setCatalogoLoading(false);
    }

    // Auto-refresh del catálogo cada 5 minutos
    const interval = setInterval(cargarCatalogo, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [theme, productos.length, cargarCatalogo, setCatalogoLoading]);

  // Formatear fecha de última actualización
  const formatUltimaActualizacion = () => {
    if (!ultimaActualizacion) return '';
    const fecha = new Date(ultimaActualizacion);
    return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  // Mostrar loading mientras carga
  if (catalogoLoading && productos.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
        <p className="text-sm text-muted-foreground">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen flex flex-col bg-background overflow-hidden">
      <Header productosFiltrados={productosFiltrados} porcentajeGanancia={porcentajeGanancia} />
      
      {/* Indicador de última actualización */}
      {ultimaActualizacion && (
        <div className="px-3 py-0.5 bg-muted/50 border-b border-border flex items-center justify-end gap-1">
          <RefreshCw className={`h-2.5 w-2.5 text-muted-foreground ${catalogoLoading ? 'animate-spin' : ''}`} />
          <span className="text-[10px] text-muted-foreground">
            Actualizado: {formatUltimaActualizacion()}
          </span>
        </div>
      )}
      
      {/* Layout adaptable */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Parte superior: Catálogo (tabla y detalle) */}
        <div className={`flex border-b border-border min-h-0 transition-all duration-300 ${orderExpanded ? 'flex-[55]' : 'flex-1'}`}>
          {/* Tabla de productos - más ancha */}
          <div className={`border-r border-border overflow-hidden transition-all duration-300 ${orderExpanded ? 'w-[65%]' : 'w-[68%]'}`}>
            <ProductTable onFilteredProductsChange={setProductosFiltrados} />
          </div>

          {/* Panel de detalle - más compacto */}
          <div className={`overflow-hidden transition-all duration-300 ${orderExpanded ? 'w-[35%]' : 'w-[32%]'}`}>
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
