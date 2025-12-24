-- Tabla de perfiles de clientes
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  razon_social TEXT NOT NULL,
  cuit_dni TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  direccion TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  whatsapp_verified BOOLEAN DEFAULT FALSE,
  setup_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de coeficientes por usuario
CREATE TABLE public.client_coefficients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'general' CHECK (mode IN ('general', 'by_category')),
  general_coef NUMERIC(10,4) NOT NULL DEFAULT 1.00,
  category_coefs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de catálogos PDF
CREATE TABLE public.pdf_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de configuración de empresa (para WhatsApp empresa)
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de pedidos guardados con PDF
CREATE TABLE public.saved_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_data JSONB NOT NULL,
  pdf_url TEXT,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_orders ENABLE ROW LEVEL SECURITY;

-- Políticas para client_profiles (cada usuario ve/edita solo su perfil)
CREATE POLICY "Users can view own profile" ON public.client_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.client_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.client_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para client_coefficients
CREATE POLICY "Users can view own coefficients" ON public.client_coefficients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coefficients" ON public.client_coefficients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coefficients" ON public.client_coefficients
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para pdf_catalogs (todos pueden ver catálogos habilitados)
CREATE POLICY "Anyone can view enabled catalogs" ON public.pdf_catalogs
  FOR SELECT USING (enabled = true);

-- Políticas para app_settings (todos pueden leer)
CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT USING (true);

-- Políticas para saved_orders
CREATE POLICY "Users can view own orders" ON public.saved_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.saved_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_coefficients_updated_at
  BEFORE UPDATE ON public.client_coefficients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar configuración inicial de WhatsApp empresa
INSERT INTO public.app_settings (key, value) VALUES ('whatsapp_empresa', '');

-- Insertar catálogos de ejemplo
INSERT INTO public.pdf_catalogs (title, description, file_url, display_order) VALUES
  ('Catálogo General 2024', 'Listado completo de productos', 'https://example.com/catalogo-general.pdf', 1),
  ('Catálogo Filtros', 'Filtros de aceite, aire y combustible', 'https://example.com/catalogo-filtros.pdf', 2),
  ('Catálogo Correas', 'Correas de distribución y accesorios', 'https://example.com/catalogo-correas.pdf', 3);

-- Crear bucket para PDFs de pedidos
INSERT INTO storage.buckets (id, name, public) VALUES ('order-pdfs', 'order-pdfs', true);