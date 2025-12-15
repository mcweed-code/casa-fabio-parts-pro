import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { useAppStore } from '@/store/useAppStore';
import { formatearPrecio } from '@/utils/pricing';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 50;

export function ProductTable() {
  const { productos, productoSeleccionado, setProductoSeleccionado, mostrarCostos } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todas');
  const [selectedMarca, setSelectedMarca] = useState<string>('Todas');
  const [currentPage, setCurrentPage] = useState(1);

  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setSelectedCategory('Todas');
    setSelectedSubcategory('Todas');
    setSelectedMarca('Todas');
    setCurrentPage(1);
  };

  // Obtener categorías, subcategorías y marcas únicas
  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria));
    return ['Todas', ...Array.from(cats)];
  }, [productos]);

  const subcategorias = useMemo(() => {
    const filtered = selectedCategory === 'Todas' 
      ? productos 
      : productos.filter(p => p.categoria === selectedCategory);
    const subs = new Set(filtered.map((p) => p.subcategoria));
    return ['Todas', ...Array.from(subs)];
  }, [productos, selectedCategory]);

  const marcas = useMemo(() => {
    const marks = new Set(productos.map((p) => p.marca));
    return ['Todas', ...Array.from(marks)];
  }, [productos]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const matchSearch =
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'Todas' || producto.categoria === selectedCategory;

      const matchSubcategory =
        selectedSubcategory === 'Todas' || producto.subcategoria === selectedSubcategory;

      const matchMarca =
        selectedMarca === 'Todas' || producto.marca === selectedMarca;

      return matchSearch && matchCategory && matchSubcategory && matchMarca;
    });
  }, [productos, searchTerm, selectedCategory, selectedSubcategory, selectedMarca]);

  // Paginación
  const totalPages = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const productosPaginados = productosFiltrados.slice(startIndex, endIndex);

  // Reset página cuando cambian filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, selectedMarca]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Filtros compactos */}
      <div className="p-2 space-y-2 border-b border-border bg-card/50 shrink-0">
        <div className="flex gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-7 text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handleLimpiarFiltros}
            title="Limpiar búsqueda"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setSelectedSubcategory('Todas');
          }}>
            <SelectTrigger className="h-7 text-xs">
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

          <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Subcategoría" />
            </SelectTrigger>
            <SelectContent>
              {subcategorias.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMarca} onValueChange={setSelectedMarca}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              {marcas.map((marca) => (
                <SelectItem key={marca} value={marca}>
                  {marca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto min-h-0">
        {productosFiltrados.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No se encontraron productos
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-table-header text-foreground z-10">
              <tr>
                <th className="text-left px-2 py-1.5 font-semibold">Código</th>
                <th className="text-left px-2 py-1.5 font-semibold">Descripción</th>
                <th className="text-left px-2 py-1.5 font-semibold">Marca</th>
                <th className="text-right px-2 py-1.5 font-semibold">
                  {mostrarCostos ? 'P. Lista' : 'P. Venta'}
                </th>
              </tr>
            </thead>
            <tbody>
              {productosPaginados.map((producto) => {
                const isSelected = productoSeleccionado?.codigo === producto.codigo;
                // Cuando oculta costos, mostrar precioLista (venta); cuando muestra costos, mostrar precioCosto (lista)
                const precioMostrar = mostrarCostos ? producto.precioCosto : producto.precioLista;
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
                    <td className="px-2 py-1.5 font-mono font-medium">
                      {producto.codigo}
                    </td>
                    <td className="px-2 py-1.5 truncate max-w-[150px]">
                      {producto.descripcion}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {producto.marca}
                    </td>
                    <td className="px-2 py-1.5 text-right font-medium">
                      {formatearPrecio(precioMostrar)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación compacta */}
      <div className="px-2 py-1.5 border-t border-border bg-card/50 flex items-center justify-between shrink-0">
        <div className="text-xs text-muted-foreground">
          {startIndex + 1}-{Math.min(endIndex, productosFiltrados.length)} de {productosFiltrados.length}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Ant
            </Button>
            <span className="text-xs">
              {currentPage}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sig
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
