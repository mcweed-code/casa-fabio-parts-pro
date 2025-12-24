# Casa Fabio - Sistema de Gestión de Pedidos

Sistema de escritorio para distribuidora de autopartes desarrollado con React + TypeScript + Vite + Lovable Cloud.

## 🚀 Inicio Rápido

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

La aplicación estará disponible en `http://localhost:8080`

## 🔐 Autenticación y Configuración

### Flujo de Usuario

1. **Registro/Login**: El usuario se registra o inicia sesión en `/auth`
2. **Setup Inicial**: Al primer ingreso, completa un wizard de configuración en `/setup`:
   - Datos del cliente (razón social, CUIT, teléfono, dirección)
   - Coeficientes de ganancia por categoría
3. **Acceso Completo**: Una vez configurado, accede al catálogo y funcionalidades

### Páginas Disponibles

- `/auth` - Registro e inicio de sesión
- `/setup` - Wizard de configuración inicial
- `/` - Catálogo principal de productos
- `/cliente` - Gestión de perfil y coeficientes
- `/catalogos` - Descarga de catálogos PDF

## 🎨 Personalización

### Logo SVG

Para reemplazar el logo de Casa Fabio:

1. Navegá a `src/assets/logo.svg`
2. Reemplazá el contenido con tu logo SVG personalizado
3. El logo se importa como módulo ES6 en el Header para máxima compatibilidad con builds de producción

### Catálogo de Productos

#### Configurar URL del JSON

Para conectar con tu servidor de catálogo:

1. Abrí `src/services/catalogService.ts`
2. Modificá la constante `CATALOG_URL`:

```typescript
const CATALOG_URL = 'https://tu-servidor.com/api/catalogo.json';
```

#### Formato del JSON

El servidor debe devolver un array de productos con esta estructura:

```json
[
  {
    "codigo": "FAR-001",
    "descripcion": "Faro Delantero Derecho Universal LED",
    "categoria": "Iluminación",
    "subcategoria": "Faros",
    "marca": "Osram",
    "precioCosto": 15000,
    "precioLista": 22500,
    "imagenUrl": "https://..." // opcional
  }
]
```

## 📱 Funcionalidades

### Autenticación
- ✅ Registro con email y contraseña
- ✅ Inicio de sesión
- ✅ Perfil de cliente persistente
- ✅ Wizard de configuración inicial

### Catálogo
- ✅ Búsqueda por código y descripción
- ✅ Filtro por categoría, subcategoría y marca
- ✅ Vista de detalle con imagen ampliable (lightbox)
- ✅ Carga inicial con indicador de progreso
- ✅ Indicador de última actualización
- ✅ Tabla sin scroll horizontal con truncado de texto

### Precios y Coeficientes
- ✅ Coeficientes de ganancia personalizables por categoría
- ✅ Coeficiente general para categorías no definidas
- ✅ Cálculo automático de precio de venta según coeficientes
- ✅ Toggle para mostrar/ocultar precios de costo

### Catálogos PDF
- ✅ Listado de catálogos disponibles
- ✅ Descarga directa de PDFs
- ✅ Vista previa integrada

### Pedidos
- ✅ Gestión de pedidos con cliente y observaciones
- ✅ Coeficiente global y específico por producto
- ✅ Cálculo automático de precios y totales
- ✅ Edición inline de items
- ✅ Panel colapsable de resumen

### Exportación
- ✅ Descarga Excel con productos filtrados
- ✅ Excel incluye precio de venta con ganancia aplicada
- ✅ Envío por WhatsApp Web
- ✅ Generación de PDF de pedido
- ✅ Guardado en base de datos

### Imágenes
- ✅ Lightbox para ver imágenes en tamaño completo
- ✅ Manejo de imágenes rotas sin afectar otras
- ✅ Placeholder para productos sin imagen

### Temas
- ✅ Tema oscuro (por defecto)
- ✅ Tema claro
- ✅ Persistencia de preferencia

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **Tailwind CSS** - Estilos
- **Shadcn/ui** - Componentes UI
- **Lucide React** - Iconos
- **Lovable Cloud** - Backend (autenticación, base de datos, storage)
- **jsPDF** - Generación de PDFs
- **xlsx** - Exportación a Excel

## 🗄️ Base de Datos

### Tablas Principales

- **client_profiles** - Perfiles de clientes (razón social, CUIT, contacto)
- **client_coefficients** - Coeficientes de ganancia por categoría
- **pdf_catalogs** - Catálogos PDF disponibles para descarga
- **saved_orders** - Pedidos guardados
- **app_settings** - Configuración global (WhatsApp empresa)

## 📦 Empaquetado para Escritorio

### Electron (Recomendado)

```bash
# Instalar Electron
npm install --save-dev electron electron-builder

# Configurar y empaquetar
# (Seguir guías oficiales de Electron)
```

### Tauri (Alternativa ligera)

```bash
# Instalar Tauri CLI
npm install --save-dev @tauri-apps/cli

# Configurar y empaquetar
# (Seguir guías oficiales de Tauri)
```

## 🎯 Estructura del Proyecto

```
src/
├── assets/              # Assets estáticos (logo.svg)
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn)
│   ├── AppHeader.tsx   # Header con navegación y tema
│   ├── AppLayout.tsx   # Layout principal
│   ├── ProductTable.tsx # Tabla de productos con filtros
│   ├── ProductDetailPanel.tsx # Panel de detalle del producto
│   ├── ImageLightbox.tsx # Visor de imágenes ampliadas
│   ├── NavLink.tsx
│   └── OrderSummary.tsx # Resumen del pedido
├── hooks/              # Hooks personalizados
│   └── useAuth.tsx     # Hook de autenticación
├── pages/              # Páginas
│   ├── Auth.tsx        # Login/Registro
│   ├── Setup.tsx       # Wizard de configuración
│   ├── Index.tsx       # Catálogo principal
│   ├── Cliente.tsx     # Perfil del cliente
│   └── Catalogos.tsx   # Catálogos PDF
├── services/           # Servicios (API, catálogo)
│   └── catalogService.ts
├── store/              # Estado global (Zustand)
│   └── useAppStore.ts  # Store con productos, pedido, tema
├── types/              # Tipos TypeScript
│   └── index.ts
├── utils/              # Utilidades
│   ├── pricing.ts      # Cálculos de precios
│   ├── coefficients.ts # Manejo de coeficientes
│   ├── pdfGenerator.ts # Generación de PDFs
│   ├── exportacion.ts  # Exportación a Excel
│   └── whatsapp.ts     # Generación de mensaje WhatsApp
└── index.css           # Sistema de diseño (tokens CSS)
```

## 🎨 Sistema de Diseño

Los colores y estilos están centralizados en:
- `src/index.css` - Variables CSS (colores, sombras)
- `tailwind.config.ts` - Configuración de Tailwind

### Paleta de Colores

- **Primario**: `#18202e` - Fondo oscuro principal
- **Secundario**: `#fdfdfd` - Fondos claros
- **Acento**: `#dc2626` - Rojo para CTAs y destacados

## 📋 Especificaciones de la Tabla

La tabla de productos está optimizada para los siguientes límites de caracteres:
- **Código**: máximo 16 caracteres (100px)
- **Descripción**: máximo 88 caracteres (flexible, con truncado)
- **Marca**: máximo 14 caracteres (80px)
- **Precio**: máximo 11 caracteres (85px)

El texto que exceda estos límites se trunca con puntos suspensivos (...) y muestra el texto completo en tooltip al pasar el mouse.

## 📄 Licencia

Desarrollado para Casa Fabio - Distribuidora de Autopartes

---

**Contacto**: [Tu información de contacto]
