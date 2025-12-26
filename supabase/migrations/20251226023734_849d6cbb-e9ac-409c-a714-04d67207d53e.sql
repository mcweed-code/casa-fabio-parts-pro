-- Agregar campo numero_cliente a client_profiles
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS numero_cliente TEXT UNIQUE;

-- Crear índice para búsqueda por numero_cliente
CREATE INDEX IF NOT EXISTS idx_client_profiles_numero_cliente 
ON public.client_profiles(numero_cliente);

-- Modificar category_coefs a subcategory_coefs en client_coefficients
ALTER TABLE public.client_coefficients 
RENAME COLUMN category_coefs TO subcategory_coefs;