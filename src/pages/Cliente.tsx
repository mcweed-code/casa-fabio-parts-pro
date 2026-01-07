import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Calculator } from 'lucide-react';
import { Categoria } from '@/types';

const CATEGORIAS: Categoria[] = [
  'Iluminación', 'Frenos', 'Suspensión', 'Motor', 'Transmisión',
  'Accesorios', 'Eléctrico', 'Filtros', 'Refrigeración'
];

const profileSchema = z.object({
  razon_social: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200),
  cuit_dni: z.string().trim().min(7, 'Mínimo 7 caracteres').max(20),
  email: z.string().trim().email('Email inválido').max(255),
  whatsapp: z.string().trim().regex(/^[0-9]{10,15}$/, 'Número inválido (10-15 dígitos)'),
  direccion: z.string().trim().max(300).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Cliente() {
  const { user, loading, isSetupComplete, profile, coefficients, refreshProfile, refreshCoefficients } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [useCategoryCoefs, setUseCategoryCoefs] = useState(coefficients?.mode === 'by_category');
  const [generalCoef, setGeneralCoef] = useState(coefficients?.general_coef || 1.25);
  const [categoryCoefs, setCategoryCoefs] = useState<Record<string, number>>(
    coefficients?.category_coefs || Object.fromEntries(CATEGORIAS.map(c => [c, 1.25]))
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      razon_social: profile?.razon_social || '',
      cuit_dni: profile?.cuit_dni || '',
      email: profile?.email || '',
      whatsapp: profile?.whatsapp || '',
      direccion: profile?.direccion || '',
    },
  });

  // Redirect if not logged in or setup not complete
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!isSetupComplete) {
        navigate('/setup');
      }
    }
  }, [user, loading, isSetupComplete, navigate]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        razon_social: profile.razon_social,
        cuit_dni: profile.cuit_dni,
        email: profile.email,
        whatsapp: profile.whatsapp,
        direccion: profile.direccion || '',
      });
    }
  }, [profile, form]);

  // Update coefficients state when data loads
  useEffect(() => {
    if (coefficients) {
      setUseCategoryCoefs(coefficients.mode === 'by_category');
      setGeneralCoef(Number(coefficients.general_coef) || 1.25);
      setCategoryCoefs(coefficients.category_coefs || Object.fromEntries(CATEGORIAS.map(c => [c, 1.25])));
    }
  }, [coefficients]);

  const handleSaveProfile = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('client_profiles')
        .update({
          razon_social: data.razon_social,
          cuit_dni: data.cuit_dni,
          email: data.email,
          whatsapp: data.whatsapp,
          direccion: data.direccion || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: 'Perfil actualizado',
        description: 'Los datos se guardaron correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCoefficients = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('client_coefficients')
        .update({
          mode: useCategoryCoefs ? 'by_category' : 'general',
          general_coef: generalCoef,
          category_coefs: useCategoryCoefs ? categoryCoefs : {},
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshCoefficients();
      toast({
        title: 'Coeficientes actualizados',
        description: 'Los coeficientes se guardaron correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Datos del Cliente
              </CardTitle>
              <CardDescription>
                Tu información de contacto y facturación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="razon_social"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón Social / Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cuit_dni"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CUIT / DNI</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-2">
                    {profile.email_verified && <Badge variant="secondary">Email verificado</Badge>}
                    {profile.whatsapp_verified && <Badge variant="secondary">WhatsApp verificado</Badge>}
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Guardar Perfil
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Coefficients Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Coeficientes de Ganancia
              </CardTitle>
              <CardDescription>
                Define tu margen de ganancia sobre los precios base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Coeficiente General</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={generalCoef}
                  onChange={(e) => setGeneralCoef(parseFloat(e.target.value) || 1)}
                  className="mt-1 w-32"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ejemplo: 1.25 = 25% de ganancia
                </p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium">Usar coeficientes por categoría</label>
                  <p className="text-xs text-muted-foreground">
                    Un coeficiente distinto para cada categoría
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

              <Button onClick={handleSaveCoefficients} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Guardar Coeficientes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
