import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface SubcategoryCoefficient {
  subcategory_id: string;
  coefficient: number;
}

interface CoefficientConfigSectionProps {
  clientId?: string;
}

export function CoefficientConfigSection({ clientId }: CoefficientConfigSectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Coefficient state
  const [generalCoef, setGeneralCoef] = useState<number>(1.00);
  const [mode, setMode] = useState<'general' | 'subcategory'>('general');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryCoefs, setSubcategoryCoefs] = useState<Record<string, number>>({});

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load subcategories
      const { data: subcatData, error: subcatError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('active', true)
        .order('category_id', { ascending: true });
      
      if (subcatError) throw subcatError;
      setSubcategories(subcatData || []);

      // Load user coefficients if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load general coefficient from client_coefficients
        const { data: coefData } = await supabase
          .from('client_coefficients')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (coefData) {
          setGeneralCoef(Number(coefData.general_coef) || 1.00);
          setMode(coefData.mode === 'subcategory' ? 'subcategory' : 'general');
        }

        // Load subcategory coefficients
        const { data: profileData } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          const { data: subcatCoefData } = await supabase
            .from('client_subcategory_coefficients')
            .select('*')
            .eq('client_id', profileData.id);
          
          if (subcatCoefData) {
            const coefMap: Record<string, number> = {};
            subcatCoefData.forEach((item) => {
              coefMap[item.subcategory_id] = Number(item.coefficient);
            });
            setSubcategoryCoefs(coefMap);
          }
        }
      }
    } catch (error) {
      console.error('Error loading coefficient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryCoefChange = (subcatId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0) {
      setSubcategoryCoefs(prev => ({
        ...prev,
        [subcatId]: numValue
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'Debes iniciar sesión para guardar la configuración.',
          variant: 'destructive',
        });
        return;
      }

      // Save general coefficient
      const { error: coefError } = await supabase
        .from('client_coefficients')
        .upsert({
          user_id: user.id,
          general_coef: generalCoef,
          mode: mode,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (coefError) throw coefError;

      // If mode is subcategory, save subcategory coefficients
      if (mode === 'subcategory') {
        const { data: profileData } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          // Delete existing and insert new
          await supabase
            .from('client_subcategory_coefficients')
            .delete()
            .eq('client_id', profileData.id);

          const inserts = Object.entries(subcategoryCoefs)
            .filter(([_, coef]) => coef > 0)
            .map(([subcatId, coef]) => ({
              client_id: profileData.id,
              subcategory_id: subcatId,
              coefficient: coef,
            }));

          if (inserts.length > 0) {
            const { error: insertError } = await supabase
              .from('client_subcategory_coefficients')
              .insert(inserts);
            
            if (insertError) throw insertError;
          }
        }
      }

      toast({
        title: 'Guardado',
        description: 'La configuración de coeficientes se guardó correctamente.',
      });
    } catch (error) {
      console.error('Error saving coefficients:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración. Intente nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Group subcategories by category
  const subcategoriesByCategory = subcategories.reduce((acc, subcat) => {
    if (!acc[subcat.category_id]) {
      acc[subcat.category_id] = [];
    }
    acc[subcat.category_id].push(subcat);
    return acc;
  }, {} as Record<string, Subcategory[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-accent" />
          <CardTitle className="text-base">Configuración de Coeficiente</CardTitle>
        </div>
        <CardDescription>
          Define el coeficiente de ganancia para calcular precios de venta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* General coefficient */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="generalCoef">Coeficiente General</Label>
            <Input
              id="generalCoef"
              type="number"
              step="0.01"
              min="0"
              value={generalCoef}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0) setGeneralCoef(val);
              }}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Ejemplo: 1.25 = +25% sobre precio de lista
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Aplicar coeficiente por subcategorías</Label>
            <Select
              value={mode}
              onValueChange={(value) => setMode(value as 'general' | 'subcategory')}
            >
              <SelectTrigger id="mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">No (usar general)</SelectItem>
                <SelectItem value="subcategory">Sí (configurar por subcategoría)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subcategory coefficients */}
        {mode === 'subcategory' && (
          <div className="border rounded-lg p-3 bg-muted/30">
            <p className="text-sm font-medium mb-3">Coeficientes por Subcategoría</p>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-4">
                {Object.entries(subcategoriesByCategory).map(([category, subcats]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-accent mb-2">{category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {subcats.map((subcat) => (
                        <div key={subcat.id} className="flex items-center gap-2">
                          <Label className="text-xs flex-1 truncate" title={subcat.name}>
                            {subcat.name}
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={subcategoryCoefs[subcat.id] || generalCoef}
                            onChange={(e) => handleSubcategoryCoefChange(subcat.id, e.target.value)}
                            className="w-20 h-7 text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">
              Si no se configura, se usa el coeficiente general
            </p>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar coeficientes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
