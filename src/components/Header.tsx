import { Moon, Sun, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '@/store/useAppStore';
import { descargarExcelProductos } from '@/utils/exportacion';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { theme, toggleTheme, productos } = useAppStore();
  const { toast } = useToast();

  const handleExportarExcel = () => {
    const fecha = new Date().toISOString().split('T')[0];
    descargarExcelProductos(productos, `lista-precios-casa-fabio-${fecha}.xlsx`);
    toast({
      title: 'Lista exportada',
      description: 'La lista de precios se descargó correctamente en formato Excel.',
    });
  };

  const handleDescargarCatalogos = () => {
    // Por ahora mostrar toast informativo - los PDFs se adjuntarán después
    toast({
      title: 'Catálogos PDF',
      description: 'Los catálogos estarán disponibles próximamente.',
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDescargarCatalogos}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Catálogos PDF
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarExcel}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar lista
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full bg-accent hover:bg-accent/80 text-accent-foreground"
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
