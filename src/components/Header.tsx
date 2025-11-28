import { Moon, Sun, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '@/store/useAppStore';
import { catalogService, mockCatalog } from '@/services/catalogService';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { theme, toggleTheme, setCatalogo, setCatalogoLoading, setCatalogoError } = useAppStore();
  const { toast } = useToast();

  const handleActualizarCatalogo = async () => {
    setCatalogoLoading(true);
    setCatalogoError(null);
    
    try {
      // Intentar obtener del servidor
      // En desarrollo, usar mock data
      const productos = mockCatalog; // Cambiar por: await catalogService.fetchCatalogWithRetry();
      setCatalogo(productos);
      toast({
        title: 'Catálogo actualizado',
        description: `Se cargaron ${productos.length} productos correctamente.`,
      });
    } catch (error) {
      setCatalogoError('Error al actualizar catálogo');
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el catálogo. Usando datos locales.',
        variant: 'destructive',
      });
      // Fallback a mock data
      setCatalogo(mockCatalog);
    } finally {
      setCatalogoLoading(false);
    }
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img 
            src="/logo.svg" 
            alt="Casa Fabio" 
            className="h-10 text-foreground"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleActualizarCatalogo}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar catálogo
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
