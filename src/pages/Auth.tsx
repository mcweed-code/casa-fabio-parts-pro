import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import { supabase } from '@/integrations/supabase/client';

// El número de cliente se trata como string para permitir ceros a la izquierda (ej: "00123")
const authSchema = z.object({
  numeroCliente: z.string().trim().min(1, { message: 'Número de cliente requerido' }).max(50),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }).max(72),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading, isSetupComplete } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      numeroCliente: '',
      password: '',
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      // Siempre redirigir a Mis Datos después de login
      navigate('/cliente');
    }
  }, [user, loading, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      // Primero buscar el email asociado al número de cliente
      const { data: profileData, error: profileError } = await supabase
        .from('client_profiles')
        .select('email')
        .eq('numero_cliente', data.numeroCliente)
        .maybeSingle();

      if (profileError) {
        toast({
          title: 'Error',
          description: 'Error al buscar el cliente.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!profileData) {
        toast({
          title: 'Cliente no encontrado',
          description: 'El número de cliente ingresado no existe.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Ahora hacer login con el email encontrado
      const { error } = await signIn(profileData.email, data.password);
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Contraseña incorrecta. Verificá e intentá de nuevo.';
        }
        toast({
          title: 'Error al iniciar sesión',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Bienvenido',
          description: 'Sesión iniciada correctamente.',
        });
        // Redirigir a Mis Datos
        navigate('/cliente');
      }
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
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <img src={logoSvg} alt="Casa Fabio" className="h-14" />
          </div>
          <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
          <CardDescription className="text-xs">
            Ingresá tu número de cliente y contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="numeroCliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Número de Cliente</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Ej: 00123"
                        autoComplete="username"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-9" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ingresar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
