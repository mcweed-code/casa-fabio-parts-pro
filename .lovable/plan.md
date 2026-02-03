

## Mejora de Búsqueda de Productos

### Problema Actual
La búsqueda actual tiene dos limitaciones:
1. **Busca desde el primer caracter** - si escribes "a" ya filtra
2. **Solo encuentra palabras consecutivas** - buscar "filtro aceite" no encuentra "FILTRO DE ACEITE MOTOR"

### Solución Propuesta

**Archivo:** `src/components/ProductTable.tsx`

#### 1. Búsqueda desde el segundo caracter
La búsqueda solo se activará cuando el usuario escriba 2 o más caracteres. Esto evita filtrados masivos con una sola letra.

#### 2. Búsqueda por palabras separadas (fuzzy match)
Si el cliente escribe "filtro aceite", el sistema:
- Divide la búsqueda en palabras: `["filtro", "aceite"]`
- Busca que **TODAS** las palabras estén presentes en código o descripción
- No importa el orden ni si hay palabras intermedias

**Ejemplo:**
- Búsqueda: `"filtro aceite"`
- Encuentra: `"FILTRO DE ACEITE MOTOR"` ✅
- Encuentra: `"ACEITE PARA FILTRO"` ✅
- No encuentra: `"FILTRO DE AIRE"` ❌ (falta "aceite")

### Cambio en el Código

```typescript
// Función auxiliar para búsqueda flexible
const matchesSearch = (searchTerm: string, producto: Producto): boolean => {
  // No filtrar si hay menos de 2 caracteres
  if (searchTerm.length < 2) return true;
  
  const searchLower = searchTerm.toLowerCase();
  const textoProducto = `${producto.codigo} ${producto.descripcion}`.toLowerCase();
  
  // Dividir búsqueda en palabras (separadas por espacios)
  const palabras = searchLower.split(/\s+/).filter(p => p.length > 0);
  
  // Todas las palabras deben estar presentes
  return palabras.every(palabra => textoProducto.includes(palabra));
};

// En productosFiltrados useMemo:
const matchSearch = matchesSearch(searchTerm, producto);
```

### Comportamiento Final

| Búsqueda | Resultado |
|----------|-----------|
| `"f"` | Sin filtro (menos de 2 chars) |
| `"fi"` | Filtra productos con "fi" |
| `"filtro aceite"` | Productos que contengan ambas palabras |
| `"123 filtro"` | Código o descripción con "123" Y "filtro" |

---

### Sección Técnica

**Archivo a modificar:** `src/components/ProductTable.tsx`

**Cambios específicos:**
1. Crear función `matchesSearch(searchTerm, producto)` antes del componente
2. Modificar líneas 83-85 del `useMemo` para usar la nueva función
3. Mantener el resto de la lógica de filtros (categoría, subcategoría, marca) sin cambios

**Complejidad:** La búsqueda sigue siendo O(n) donde n es el número de productos, solo cambia la lógica de comparación.

