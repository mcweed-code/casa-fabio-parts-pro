import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { ProductTable } from '@/components/ProductTable';
import { ProductDetailPanel } from '@/components/ProductDetailPanel';
import { OrderSummary } from '@/components/OrderSummary';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { mockCatalog } from '@/services/catalogService';
import { Producto } from '@/types';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

const Index = () => {
  const { user, loading: authLoading, isSetupComplete, profile } = useAuth();
  const navigate = useNavigate();
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

  // Auth protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isSetupComplete) {
        navigate('/setup');
      }
    }
  }, [user, authLoading, isSetupComplete, navigate]);

  const cargarCatalogo = useCallback(async () => {
    try {
      setCatalogoLoading(true);
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (productos.length === 0 && user && isSetupComplete) {
      cargarCatalogo();
    } else {
      setCatalogoLoading(false);
    }
    const interval = setInterval(cargarCatalogo, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [theme, productos.length, cargarCatalogo, setCatalogoLoading, user, isSetupComplete]);

  // Formato: "25/12/2025 14:32"
  const formatUltimaActualizacion = () => {
    if (!ultimaActualizacion) return '';
    const fecha = new Date(ultimaActualizacion);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
      + ' ' + fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading || (catalogoLoading && productos.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="px-3 py-0.5 bg-muted/50 border-b border-border flex items-center gap-2">
        {profile && (
          <span className="text-[10px] font-medium text-foreground truncate max-w-[200px]">
            Cliente: {profile.razon_social}
          </span>
        )}
        <div className="flex-1" />
        {ultimaActualizacion && (
          <>
            <RefreshCw className={`h-2.5 w-2.5 text-muted-foreground ${catalogoLoading ? 'animate-spin' : ''}`} />
            <span className="text-[10px] text-muted-foreground">
              {formatUltimaActualizacion()}
            </span>
          </>
        )}
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className={`flex border-b border-border min-h-0 transition-all duration-300 ${orderExpanded ? 'flex-[55]' : 'flex-1'}`}>
          <div className={`border-r border-border overflow-hidden transition-all duration-300 ${orderExpanded ? 'w-[65%]' : 'w-[68%]'}`}>
            <ProductTable onFilteredProductsChange={setProductosFiltrados} />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${orderExpanded ? 'w-[35%]' : 'w-[32%]'}`}>
            <ProductDetailPanel />
          </div>
        </div>
        <div className={`shrink-0 transition-all duration-300 ${orderExpanded ? 'flex-[45] min-h-[120px]' : 'h-auto'}`}>
          <OrderSummary 
            isExpanded={orderExpanded} 
            onToggle={() => setOrderExpanded(!orderExpanded)} 
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
