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

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Email inválido' }).max(255),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }).max(72),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, loading, isSetupComplete } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (isSetupComplete) {
        navigate('/');
      } else {
        navigate('/setup');
      }
    }
  }, [user, loading, isSetupComplete, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          let errorMessage = error.message;
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Credenciales inválidas. Verificá tu email y contraseña.';
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
        }
      } else {
        const { error } = await signUp(data.email, data.password);
        if (error) {
          let errorMessage = error.message;
          if (error.message.includes('User already registered')) {
            errorMessage = 'Este email ya está registrado. Intentá iniciar sesión.';
          }
          toast({
            title: 'Error al registrarse',
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Cuenta creada',
            description: 'Tu cuenta fue creada exitosamente.',
          });
        }
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoSvg} alt="Casa Fabio" className="h-16" />
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Ingresá tus credenciales para acceder'
              : 'Registrate para comenzar a usar la app'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? 'Iniciar Sesión' : 'Registrarme'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? '¿No tenés cuenta? Registrate'
                : '¿Ya tenés cuenta? Iniciá sesión'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
