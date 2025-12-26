import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, LogOut, User, Percent } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { parsePercent } from '@/utils/coefficientHelpers';

const profileSchema = z.object({
  razon_social: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200),
  cuit_dni: z.string().trim().min(7, 'Mínimo 7 caracteres').max(20),
  email: z.string().trim().email('Email inválido').max(255),
  whatsapp: z.string().trim().regex(/^[0-9]{10,15}$/, 'Número inválido (10-15 dígitos)'),
  direccion: z.string().trim().max(300).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Cliente() {
  const { user, loading, isSetupComplete, profile, coefficients, refreshProfile, refreshCoefficients, signOut } = useAuth();
  const { productos } = useAppStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCoefs, setIsSavingCoefs] = useState(false);

  // Coeficientes: se guardan como porcentaje (30 = 30%)
  const [useSubcatCoefs, setUseSubcatCoefs] = useState(coefficients?.mode === 'by_subcategory');
  const [generalCoef, setGeneralCoef] = useState<string>(
    coefficients ? String(coefficients.general_coef) : '25'
  );
  const [subcatCoefs, setSubcatCoefs] = useState<Record<string, string>>({});

  // Obtener subcategorías únicas del catálogo
  const subcategorias = useMemo(() => {
    const subs = new Set(productos.map((p) => p.subcategoria).filter(Boolean));
    return Array.from(subs).sort();
  }, [productos]);

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

  // Redirect if not logged in
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
      setUseSubcatCoefs(coefficients.mode === 'by_subcategory');
      setGeneralCoef(String(coefficients.general_coef || 25));
      
      // Convertir subcategory_coefs a strings para inputs
      const coefs: Record<string, string> = {};
      if (coefficients.subcategory_coefs) {
        Object.entries(coefficients.subcategory_coefs).forEach(([key, val]) => {
          coefs[key] = String(val);
        });
      }
      setSubcatCoefs(coefs);
    }
  }, [coefficients]);

  const handleSaveProfile = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSavingProfile(true);
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
      setIsSavingProfile(false);
    }
  };

  const handleSaveCoefficients = async () => {
    if (!user) return;

    setIsSavingCoefs(true);
    try {
      // Convertir strings a números para guardar
      const parsedGeneral = parsePercent(generalCoef);
      const parsedSubcats: Record<string, number> = {};
      
      Object.entries(subcatCoefs).forEach(([key, val]) => {
        parsedSubcats[key] = parsePercent(val);
      });

      const { error } = await supabase
        .from('client_coefficients')
        .update({
          mode: useSubcatCoefs ? 'by_subcategory' : 'general',
          general_coef: parsedGeneral,
          subcategory_coefs: useSubcatCoefs ? parsedSubcats : {},
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
      setIsSavingCoefs(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
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
      <div className="flex-1 overflow-hidden p-3">
        <div className="h-full grid grid-cols-[1fr_1fr] gap-3 max-w-[960px] mx-auto">
          {/* Columna izquierda: Datos del cliente */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="py-2 px-3 shrink-0 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" /> Datos del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-3">
                  {/* Número de cliente (readonly) */}
                  {profile.numero_cliente && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Nro. Cliente</label>
                      <Input
                        value={profile.numero_cliente}
                        readOnly
                        className="h-8 text-xs bg-muted/50 mt-1"
                      />
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="razon_social"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Razón Social / Nombre *</FormLabel>
                        <FormControl>
                          <Input className="h-8 text-xs" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="cuit_dni"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">CUIT / DNI *</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-xs" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">WhatsApp *</FormLabel>
                          <FormControl>
                            <Input className="h-8 text-xs" placeholder="5491123456789" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Email *</FormLabel>
                        <FormControl>
                          <Input type="email" className="h-8 text-xs" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Dirección</FormLabel>
                        <FormControl>
                          <Input className="h-8 text-xs" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button type="submit" size="sm" className="h-8 text-xs" disabled={isSavingProfile}>
                      {isSavingProfile && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      <Save className="mr-1 h-3 w-3" /> Guardar
                    </Button>
                    <div className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-1 h-3 w-3" /> Salir
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Columna derecha: Coeficientes */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="py-2 px-3 shrink-0 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Percent className="h-4 w-4" /> Coeficiente de Ganancia
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-3 flex flex-col">
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                {/* Coeficiente general */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium shrink-0">General:</label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={generalCoef}
                      onChange={(e) => setGeneralCoef(e.target.value)}
                      className="h-8 w-20 text-xs text-center"
                      placeholder="25"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    (factor: {(1 + parsePercent(generalCoef) / 100).toFixed(2)})
                  </span>
                </div>

                {/* Toggle por subcategoría */}
                <div className="flex items-center justify-between py-2 border-y border-border">
                  <div>
                    <label className="text-xs font-medium">Por subcategoría</label>
                    <p className="text-[10px] text-muted-foreground">
                      Coeficiente distinto para cada subcategoría
                    </p>
                  </div>
                  <Switch
                    checked={useSubcatCoefs}
                    onCheckedChange={setUseSubcatCoefs}
                  />
                </div>

                {/* Lista de subcategorías */}
                {useSubcatCoefs && (
                  <ScrollArea className="flex-1 min-h-0 border rounded bg-muted/30 p-2">
                    <div className="space-y-1.5">
                      {subcategorias.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Cargá el catálogo para ver subcategorías
                        </p>
                      ) : (
                        subcategorias.map((subcat) => (
                          <div key={subcat} className="flex items-center justify-between gap-2 py-0.5">
                            <label className="text-xs flex-1 truncate" title={subcat}>
                              {subcat}
                            </label>
                            <div className="flex items-center gap-1">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={subcatCoefs[subcat] || ''}
                                onChange={(e) =>
                                  setSubcatCoefs((prev) => ({
                                    ...prev,
                                    [subcat]: e.target.value,
                                  }))
                                }
                                placeholder={generalCoef}
                                className="w-16 h-6 text-xs text-center"
                              />
                              <span className="text-[10px] text-muted-foreground">%</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}

                {/* Botón guardar */}
                <div className="shrink-0 pt-2">
                  <Button
                    onClick={handleSaveCoefficients}
                    size="sm"
                    className="w-full h-8 text-xs"
                    disabled={isSavingCoefs}
                  >
                    {isSavingCoefs && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    <Save className="mr-1 h-3 w-3" /> Guardar Coeficientes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
