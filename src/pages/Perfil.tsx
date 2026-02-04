import { useState } from 'react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CoefficientConfigSection } from '@/components/CoefficientConfigSection';

interface PerfilData {
  numeroCliente: string;
  razonSocial: string;
  nombreApellido: string;
  email: string;
  telefono: string;
  whatsapp: string;
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  cuitDni: string;
}

const Perfil = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<PerfilData>({
    numeroCliente: '',
    razonSocial: '',
    nombreApellido: '',
    email: '',
    telefono: '',
    whatsapp: '',
    calle: '',
    numero: '',
    localidad: '',
    provincia: '',
    codigoPostal: '',
    cuitDni: '',
  });

  const handleChange = (field: keyof PerfilData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.numeroCliente || !formData.razonSocial || !formData.nombreApellido || !formData.email) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    // Aquí se guardaría en la base de datos
    toast({
      title: 'Perfil guardado',
      description: 'Los datos se han actualizado correctamente.',
    });
  };

  return (
    <div className="h-screen max-h-[600px] bg-background flex flex-col overflow-hidden">
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
            <User className="h-5 w-5 text-accent" />
            <h1 className="text-lg font-semibold">Datos del Cliente</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <main className="container mx-auto px-4 py-4 max-w-4xl">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {/* Datos principales */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Información Principal</CardTitle>
                  <CardDescription className="text-xs">Datos de identificación del cliente</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 px-4 pb-4">
                  <div className="space-y-1">
                    <Label htmlFor="numeroCliente" className="text-xs">Número de Cliente *</Label>
                    <Input
                      id="numeroCliente"
                      value={formData.numeroCliente}
                      onChange={(e) => handleChange('numeroCliente', e.target.value)}
                      placeholder="Ej: 12345"
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cuitDni" className="text-xs">CUIT / DNI</Label>
                    <Input
                      id="cuitDni"
                      value={formData.cuitDni}
                      onChange={(e) => handleChange('cuitDni', e.target.value)}
                      placeholder="Ej: 20-12345678-9"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="razonSocial" className="text-xs">Razón Social *</Label>
                    <Input
                      id="razonSocial"
                      value={formData.razonSocial}
                      onChange={(e) => handleChange('razonSocial', e.target.value)}
                      placeholder="Nombre de la empresa o comercio"
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="nombreApellido" className="text-xs">Nombre y Apellidos *</Label>
                    <Input
                      id="nombreApellido"
                      value={formData.nombreApellido}
                      onChange={(e) => handleChange('nombreApellido', e.target.value)}
                      placeholder="Nombre completo del titular"
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contacto */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Contacto</CardTitle>
                  <CardDescription className="text-xs">Información de contacto</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 px-4 pb-4">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="correo@ejemplo.com"
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="telefono" className="text-xs">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="(011) 1234-5678"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="whatsapp" className="text-xs">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="+54 9 11 1234-5678"
                      className="h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dirección */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Dirección</CardTitle>
                  <CardDescription className="text-xs">Domicilio comercial o fiscal</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 px-4 pb-4">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="calle" className="text-xs">Calle</Label>
                    <Input
                      id="calle"
                      value={formData.calle}
                      onChange={(e) => handleChange('calle', e.target.value)}
                      placeholder="Nombre de la calle"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="numero" className="text-xs">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleChange('numero', e.target.value)}
                      placeholder="123"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="codigoPostal" className="text-xs">Código Postal</Label>
                    <Input
                      id="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={(e) => handleChange('codigoPostal', e.target.value)}
                      placeholder="1234"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="localidad" className="text-xs">Localidad</Label>
                    <Input
                      id="localidad"
                      value={formData.localidad}
                      onChange={(e) => handleChange('localidad', e.target.value)}
                      placeholder="Ciudad o localidad"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="provincia" className="text-xs">Provincia</Label>
                    <Input
                      id="provincia"
                      value={formData.provincia}
                      onChange={(e) => handleChange('provincia', e.target.value)}
                      placeholder="Provincia"
                      className="h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuración de Coeficiente */}
              <CoefficientConfigSection />

              {/* Botón guardar */}
              <div className="flex justify-end gap-3 pb-4">
                <Button type="button" variant="outline" size="sm" onClick={() => navigate('/')}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </Button>
              </div>
            </div>
          </form>
        </main>
      </ScrollArea>
    </div>
  );
};

export default Perfil;
