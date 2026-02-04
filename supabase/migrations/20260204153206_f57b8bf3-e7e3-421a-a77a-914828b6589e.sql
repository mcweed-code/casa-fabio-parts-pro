-- Crear tabla de subcategorías
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de coeficientes por subcategoría
CREATE TABLE public.client_subcategory_coefficients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  coefficient NUMERIC NOT NULL DEFAULT 1.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, subcategory_id)
);

-- Enable RLS
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subcategory_coefficients ENABLE ROW LEVEL SECURITY;

-- Políticas para subcategories (lectura pública)
CREATE POLICY "Anyone can read subcategories"
ON public.subcategories
FOR SELECT
USING (active = true);

-- Políticas para client_subcategory_coefficients
CREATE POLICY "Users can view own subcategory coefficients"
ON public.client_subcategory_coefficients
FOR SELECT
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own subcategory coefficients"
ON public.client_subcategory_coefficients
FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own subcategory coefficients"
ON public.client_subcategory_coefficients
FOR UPDATE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own subcategory coefficients"
ON public.client_subcategory_coefficients
FOR DELETE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- Insertar subcategorías de ejemplo basadas en las categorías existentes
INSERT INTO public.subcategories (name, category_id) VALUES
('Faros delanteros', 'Iluminación'),
('Luces traseras', 'Iluminación'),
('Luces LED', 'Iluminación'),
('Pastillas de freno', 'Frenos'),
('Discos de freno', 'Frenos'),
('Líquido de frenos', 'Frenos'),
('Amortiguadores', 'Suspensión'),
('Espirales', 'Suspensión'),
('Rotulas', 'Suspensión'),
('Bujías', 'Motor'),
('Correas', 'Motor'),
('Aceite motor', 'Motor'),
('Embrague', 'Transmisión'),
('Caja de cambios', 'Transmisión'),
('Alfombras', 'Accesorios'),
('Cubre volantes', 'Accesorios'),
('Baterías', 'Eléctrico'),
('Alternador', 'Eléctrico'),
('Filtro aceite', 'Filtros'),
('Filtro aire', 'Filtros'),
('Radiador', 'Refrigeración'),
('Termostato', 'Refrigeración');