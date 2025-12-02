import { Moon, Sun, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '@/store/useAppStore';
import { generarCSVProductos, descargarCSV } from '@/utils/exportacion';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { theme, toggleTheme, productos } = useAppStore();
  const { toast } = useToast();

  const handleExportarCSV = () => {
    const csv = generarCSVProductos(productos);
    const fecha = new Date().toISOString().split('T')[0];
    descargarCSV(csv, `lista-precios-casa-fabio-${fecha}.csv`);
    toast({
      title: 'Lista exportada',
      description: 'La lista de precios se descargó correctamente.',
    });
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar lista
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
