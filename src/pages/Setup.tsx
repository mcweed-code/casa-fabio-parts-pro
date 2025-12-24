import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronRight, Check } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import { Categoria } from '@/types';

const CATEGORIAS: Categoria[] = [
  'Iluminación', 'Frenos', 'Suspensión', 'Motor', 'Transmisión',
  'Accesorios', 'Eléctrico', 'Filtros', 'Refrigeración'
];

const profileSchema = z.object({
  razon_social: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200),
  cuit_dni: z.string().trim().min(7, 'Mínimo 7 caracteres').max(20),
  email: z.string().trim().email('Email inválido').max(255),
  whatsapp: z.string().trim().regex(/^[0-9]{10,15}$/, 'Número inválido (10-15 dígitos, sin espacios ni símbolos)'),
  direccion: z.string().trim().max(300).optional(),
});

const coefficientsSchema = z.object({
  mode: z.enum(['general', 'by_category']),
  general_coef: z.coerce.number().min(0.01, 'Debe ser mayor a 0'),
  category_coefs: z.record(z.coerce.number().min(0.01)).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type CoefficientsFormData = z.infer<typeof coefficientsSchema>;

export default function Setup() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, isSetupComplete, refreshProfile, refreshCoefficients, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      razon_social: '',
      cuit_dni: '',
      email: user?.email || '',
      whatsapp: '',
      direccion: '',
    },
  });

  const [useCategoryCoefs, setUseCategoryCoefs] = useState(false);
  const [generalCoef, setGeneralCoef] = useState(1.25);
  const [categoryCoefs, setCategoryCoefs] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIAS.map(c => [c, 1.25]))
  );

  // Redirect if not logged in or already completed setup
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (isSetupComplete) {
        navigate('/');
      }
    }
  }, [user, loading, isSetupComplete, navigate]);

  // Pre-fill email from user
  useEffect(() => {
    if (user?.email) {
      profileForm.setValue('email', user.email);
    }
  }, [user, profileForm]);

  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.from('client_profiles').insert({
        user_id: user.id,
        razon_social: data.razon_social,
        cuit_dni: data.cuit_dni,
        email: data.email,
        whatsapp: data.whatsapp,
        direccion: data.direccion || null,
        setup_completed: false,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Error',
            description: 'Ya existe un perfil con estos datos.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        await refreshProfile();
        setStep(2);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoefficientsSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Insert coefficients
      const { error: coefError } = await supabase.from('client_coefficients').insert({
        user_id: user.id,
        mode: useCategoryCoefs ? 'by_category' : 'general',
        general_coef: generalCoef,
        category_coefs: useCategoryCoefs ? categoryCoefs : {},
      });

      if (coefError) throw coefError;

      // Update profile as completed
      const { error: profileError } = await supabase
        .from('client_profiles')
        .update({ setup_completed: true })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      await refreshCoefficients();

      toast({
        title: 'Configuración completa',
        description: 'Ya podés empezar a usar la app.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la configuración.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoSvg} alt="Casa Fabio" className="h-12" />
          </div>
          <CardTitle className="text-xl">Configuración Inicial</CardTitle>
          <CardDescription>
            Paso {step} de 2: {step === 1 ? 'Datos del Cliente' : 'Coeficientes de Ganancia'}
          </CardDescription>
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="razon_social"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón Social / Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu empresa o nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="cuit_dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CUIT / DNI *</FormLabel>
                      <FormControl>
                        <Input placeholder="20-12345678-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp * (solo números)</FormLabel>
                      <FormControl>
                        <Input placeholder="5491123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle 123, Ciudad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Coeficiente General</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={generalCoef}
                    onChange={(e) => setGeneralCoef(parseFloat(e.target.value) || 1)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ejemplo: 1.25 = 25% de ganancia sobre el precio base
                  </p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="text-sm font-medium">Usar coeficientes por categoría</label>
                    <p className="text-xs text-muted-foreground">
                      Define un coeficiente distinto para cada categoría
                    </p>
                  </div>
                  <Switch
                    checked={useCategoryCoefs}
                    onCheckedChange={setUseCategoryCoefs}
                  />
                </div>

                {useCategoryCoefs && (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3 bg-muted/30">
                    {CATEGORIAS.map((cat) => (
                      <div key={cat} className="flex items-center justify-between gap-2">
                        <label className="text-sm flex-1">{cat}</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={categoryCoefs[cat] || 1.25}
                          onChange={(e) =>
                            setCategoryCoefs((prev) => ({
                              ...prev,
                              [cat]: parseFloat(e.target.value) || 1,
                            }))
                          }
                          className="w-24"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleCoefficientsSubmit} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Completar Configuración <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
