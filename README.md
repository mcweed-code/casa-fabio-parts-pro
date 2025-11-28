# Casa Fabio - Sistema de Gestión de Pedidos

Sistema de escritorio para distribuidora de autopartes desarrollado con React + TypeScript + Vite.

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

## 🎨 Personalización

### Logo SVG

Para reemplazar el logo de Casa Fabio:

1. Navegá a `public/logo.svg`
2. Reemplazá el contenido con tu logo SVG personalizado
3. El logo se muestra automáticamente en el header de la aplicación

### Catálogo de Productos

#### Configurar URL del JSON

Para conectar con tu servidor de catálogo:

1. Abrí `src/services/catalogService.ts`
2. Modificá la constante `CATALOG_URL`:

```typescript
const CATALOG_URL = 'https://tu-servidor.com/api/catalogo.json';
```

3. Descomentá la línea en `src/components/Header.tsx`:

```typescript
// Cambiar de:
const productos = mockCatalog;

// A:
const productos = await catalogService.fetchCatalogWithRetry();
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

### Catálogo
- ✅ Búsqueda por código y descripción
- ✅ Filtro por categoría
- ✅ Vista de detalle completa con imagen
- ✅ Actualización desde servidor

### Pedidos
- ✅ Gestión de pedidos con cliente y observaciones
- ✅ Coeficiente global y específico por producto
- ✅ Cálculo automático de precios y totales
- ✅ Edición inline de items

### Exportación
- ✅ Envío por WhatsApp Web
- ✅ Impresión / PDF (usando impresión del navegador)
- ✅ Guardado en localStorage

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
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn)
│   ├── Header.tsx
│   ├── ProductTable.tsx
│   ├── ProductDetailPanel.tsx
│   └── OrderSummary.tsx
├── pages/              # Páginas
│   └── Index.tsx
├── services/           # Servicios (API, catálogo)
│   └── catalogService.ts
├── store/              # Estado global (Zustand)
│   └── useAppStore.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── utils/              # Utilidades
│   ├── pricing.ts
│   └── whatsapp.ts
└── index.css           # Sistema de diseño
```

## 🎨 Sistema de Diseño

Los colores y estilos están centralizados en:
- `src/index.css` - Variables CSS (colores, sombras)
- `tailwind.config.ts` - Configuración de Tailwind

### Paleta de Colores

- **Primario**: `#18202e` - Fondo oscuro principal
- **Secundario**: `#fdfdfd` - Fondos claros
- **Acento**: `#dc2626` - Rojo para CTAs y destacados

## 📄 Licencia

Desarrollado para Casa Fabio - Distribuidora de Autopartes

---

**Contacto**: [Tu información de contacto]
