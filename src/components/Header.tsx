import { Moon, Sun, Download, FileText, User, Wallet, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useAppStore } from '@/store/useAppStore';
import { descargarExcelProductos } from '@/utils/exportacion';
import { useToast } from '@/hooks/use-toast';
import logoSvg from '@/assets/logo.svg';
import { Producto } from '@/types';

interface HeaderProps {
  productosFiltrados?: Producto[];
  porcentajeGanancia?: number;
}

export function Header({ productosFiltrados, porcentajeGanancia = 25 }: HeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme, productos } = useAppStore();
  const { toast } = useToast();

  const handleExportarExcel = () => {
    const fecha = new Date().toISOString().split('T')[0];
    // Usar productos filtrados si están disponibles, si no, todos
    const productosExportar = productosFiltrados && productosFiltrados.length > 0 
      ? productosFiltrados 
      : productos;
    descargarExcelProductos(productosExportar, `lista-precios-casa-fabio-${fecha}.xlsx`, porcentajeGanancia);
    toast({
      title: 'Lista exportada',
      description: `Se exportaron ${productosExportar.length} productos con ${porcentajeGanancia}% de ganancia.`,
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
      <div className="container mx-auto px-3 h-10 flex items-center justify-between">
        {/* Logo importado como módulo */}
        <div className="flex items-center">
          <img 
            src={logoSvg} 
            alt="Casa Fabio" 
            className="h-9 w-auto"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDescargarCatalogos}
            className="gap-1.5 h-8 text-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            Catálogos PDF
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarExcel}
            className="gap-1.5 h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar lista
          </Button>

          {/* Separador visual */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Botones de navegación estilo app */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/perfil')}
                className="rounded-full h-8 w-8"
                aria-label="Perfil del cliente"
              >
                <User className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Perfil</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/cuenta-corriente')}
                className="rounded-full h-8 w-8"
                aria-label="Cuenta corriente"
              >
                <Wallet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cuenta Corriente</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/novedades')}
                className="rounded-full h-8 w-8"
                aria-label="Novedades"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Novedades</p>
            </TooltipContent>
          </Tooltip>

          {/* Separador visual */}
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button
            variant="default"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-9 w-9 bg-accent hover:bg-accent/80 text-accent-foreground shadow-lg border-2 border-accent-foreground/20"
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
