import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAppStore } from '@/store/useAppStore';
import { Categoria } from '@/types';
import { formatearPrecio } from '@/utils/pricing';
import { cn } from '@/lib/utils';

export function ProductTable() {
  const { productos, productoSeleccionado, setProductoSeleccionado } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Categoria>('Todas');

  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria));
    return ['Todas', ...Array.from(cats)];
  }, [productos]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const matchSearch =
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'Todas' || producto.categoria === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [productos, searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col h-full">
      {/* Filtros */}
      <div className="p-4 space-y-3 border-b border-border bg-card/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Categoria)}>
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto">
        {productosFiltrados.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No se encontraron productos
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-table-header text-foreground z-10">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-sm">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-sm">Descripción</th>
                <th className="text-right px-4 py-3 font-semibold text-sm">Precio</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => {
                const isSelected = productoSeleccionado?.codigo === producto.codigo;
                return (
                  <tr
                    key={producto.codigo}
                    onClick={() => setProductoSeleccionado(producto)}
                    className={cn(
                      'cursor-pointer border-b border-border transition-smooth',
                      isSelected
                        ? 'bg-accent/20'
                        : 'hover:bg-table-row-hover'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium">
                      {producto.codigo}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {producto.descripcion}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatearPrecio(producto.precioLista)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer con conteo */}
      <div className="px-4 py-2 border-t border-border bg-card/50 text-sm text-muted-foreground">
        Mostrando {productosFiltrados.length} de {productos.length} productos
      </div>
    </div>
  );
}
