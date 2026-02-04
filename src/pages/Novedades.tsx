import { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/useDebounce';

// Productos de novedad (mock)
const novedadesProductos = [
  {
    id: 1,
    nombre: 'Kit de Herramientas Profesional',
    descripcion: 'Set completo de 150 piezas para taller mecánico. Incluye llaves, dados, destornilladores y más.',
    precio: 125000,
    imagen: '/placeholder.svg',
    categoria: 'Herramientas',
    nuevo: true,
  },
  {
    id: 2,
    nombre: 'Elevador Hidráulico 2 Columnas',
    descripcion: 'Capacidad de 4 toneladas. Ideal para talleres con alto volumen de trabajo.',
    precio: 2500000,
    imagen: '/placeholder.svg',
    categoria: 'Equipamiento',
    nuevo: true,
  },
  {
    id: 3,
    nombre: 'Compresor de Aire 100L',
    descripcion: 'Motor 3HP, tanque de 100 litros. Silencioso y de alta eficiencia.',
    precio: 450000,
    imagen: '/placeholder.svg',
    categoria: 'Equipamiento',
    nuevo: false,
  },
  {
    id: 4,
    nombre: 'Scanner Automotriz OBD2 Pro',
    descripcion: 'Diagnóstico completo para vehículos desde 1996. Pantalla táctil, actualizaciones incluidas.',
    precio: 180000,
    imagen: '/placeholder.svg',
    categoria: 'Diagnóstico',
    nuevo: true,
  },
  {
    id: 5,
    nombre: 'Banco de Trabajo con Cajones',
    descripcion: 'Superficie de acero inoxidable, 6 cajones con guías telescópicas. Dimensiones 1.5m x 0.7m.',
    precio: 320000,
    imagen: '/placeholder.svg',
    categoria: 'Mobiliario',
    nuevo: false,
  },
  {
    id: 6,
    nombre: 'Alineador y Balanceador Combo',
    descripcion: 'Equipo profesional para servicio completo de neumáticos. Incluye capacitación.',
    precio: 4800000,
    imagen: '/placeholder.svg',
    categoria: 'Equipamiento',
    nuevo: true,
  },
  {
    id: 7,
    nombre: 'Cargador de Batería Inteligente',
    descripcion: 'Carga automática, recuperación de baterías sulfatadas. Compatible con 6V y 12V.',
    precio: 45000,
    imagen: '/placeholder.svg',
    categoria: 'Electricidad',
    nuevo: false,
  },
  {
    id: 8,
    nombre: 'Prensa Hidráulica 20 Ton',
    descripcion: 'Estructura reforzada, manómetro incluido. Ideal para extracción de rodamientos.',
    precio: 280000,
    imagen: '/placeholder.svg',
    categoria: 'Herramientas',
    nuevo: false,
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const Novedades = () => {
  const navigate = useNavigate();
  const [productos] = useState(novedadesProductos);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<typeof novedadesProductos[0] | null>(null);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const productosFiltrados = useMemo(() => {
    if (debouncedSearch.length < 2) return productos;
    
    const searchLower = debouncedSearch.toLowerCase();
    const palabras = searchLower.split(/\s+/).filter(p => p.length > 0);
    
    return productos.filter((producto) => {
      const texto = `${producto.nombre} ${producto.descripcion}`.toLowerCase();
      return palabras.every(palabra => texto.includes(palabra));
    });
  }, [productos, debouncedSearch]);

  return (
    <div className="h-screen max-h-[600px] bg-background flex flex-col overflow-hidden">
      {/* Header with search */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-md shrink-0">
        <div className="container mx-auto px-4 h-12 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="h-5 w-5 text-accent" />
            <h1 className="text-lg font-semibold">Novedades</h1>
          </div>
          
          {/* Search input */}
          <div className="flex-1 max-w-xs ml-auto relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar novedades..."
              className="h-8 pl-8 pr-8 text-sm"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Badge variant="secondary" className="shrink-0">
            {productosFiltrados.length}
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto px-4 py-4">
            {productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">Sin resultados</p>
                <p className="text-sm">No se encontraron novedades para "{debouncedSearch}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {productosFiltrados.map((producto) => (
                  <Card 
                    key={producto.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                    onClick={() => setSelectedProduct(producto)}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-muted/30">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {producto.nuevo && (
                        <Badge className="absolute top-2 right-2 bg-accent text-xs">
                          Nuevo
                        </Badge>
                      )}
                    </div>

                    {/* Info - compact, no buttons */}
                    <CardContent className="p-3">
                      <p className="text-sm font-medium line-clamp-2 leading-tight mb-1">
                        {producto.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {producto.descripcion}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Product detail dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.nombre}</DialogTitle>
                <DialogDescription>
                  <Badge variant="outline" className="mt-1">{selectedProduct.categoria}</Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.imagen}
                    alt={selectedProduct.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.descripcion}
                </p>
                <div className="text-center pt-2">
                  <span className="text-2xl font-bold text-accent">
                    {formatCurrency(selectedProduct.precio)}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Novedades;
