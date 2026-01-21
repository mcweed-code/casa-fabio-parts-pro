import { useState } from 'react';
import { ArrowLeft, Sparkles, Eye, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [productos] = useState(novedadesProductos);

  const handleConsultar = (producto: typeof novedadesProductos[0]) => {
    toast({
      title: 'Consulta enviada',
      description: `Nos comunicaremos contigo sobre "${producto.nombre}".`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-md shrink-0">
        <div className="container mx-auto px-4 h-12 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h1 className="text-lg font-semibold">Novedades</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {productos.length} productos
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productos.map((producto) => (
                <Card key={producto.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Imagen */}
                  <div className="relative aspect-square bg-muted/30">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                    {producto.nuevo && (
                      <Badge className="absolute top-2 right-2 bg-accent">
                        Nuevo
                      </Badge>
                    )}
                    <Badge variant="outline" className="absolute top-2 left-2 bg-background/80">
                      {producto.categoria}
                    </Badge>
                  </div>

                  {/* Info */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm line-clamp-2 leading-tight">
                      {producto.nombre}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 pb-2">
                    <CardDescription className="text-xs line-clamp-3">
                      {producto.descripcion}
                    </CardDescription>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 pt-0">
                    <div className="w-full text-center">
                      <span className="text-lg font-bold text-accent">
                        {formatCurrency(producto.precio)}
                      </span>
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-1"
                        onClick={() => {
                          toast({
                            title: producto.nombre,
                            description: producto.descripcion,
                          });
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1"
                        onClick={() => handleConsultar(producto)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Consultar
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default Novedades;
