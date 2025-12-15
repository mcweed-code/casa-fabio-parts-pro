import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Producto, Pedido, ItemPedido, Categoria } from '@/types';
import { calcularPrecioFinal, calcularSubtotal } from '@/utils/pricing';

interface AppState {
  // Tema
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Catálogo
  productos: Producto[];
  productoSeleccionado: Producto | null;
  catalogoLoading: boolean;
  catalogoError: string | null;
  setCatalogo: (productos: Producto[]) => void;
  setProductoSeleccionado: (producto: Producto | null) => void;
  setCatalogoLoading: (loading: boolean) => void;
  setCatalogoError: (error: string | null) => void;

  // Pedido actual
  pedidoActual: Pedido;
  mostrarCostos: boolean;
  toggleMostrarCostos: () => void;
  agregarItemPedido: (producto: Producto, cantidad: number, porcentaje: number) => void;
  actualizarItemPedido: (codigoProducto: string, cantidad: number, porcentaje: number) => void;
  eliminarItemPedido: (codigoProducto: string) => void;
  vaciarPedido: () => void;
  calcularTotalPedido: () => void;

  // Pedidos guardados
  pedidosGuardados: Pedido[];
  guardarPedido: (pedido: Pedido) => void;
  cargarPedido: (pedidoId: string) => void;
  duplicarPedido: (pedidoId: string) => void;
  eliminarPedidoGuardado: (pedidoId: string) => void;
}

const crearPedidoVacio = (): Pedido => ({
  id: crypto.randomUUID(),
  items: [],
  total: 0,
  fecha: new Date().toISOString(),
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      theme: 'dark', // Dark por defecto según requerimiento
      productos: [],
      productoSeleccionado: null,
      catalogoLoading: false,
      catalogoError: null,
      pedidoActual: crearPedidoVacio(),
      pedidosGuardados: [],
      mostrarCostos: true,

      // Tema
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          // Aplicar clase al HTML
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
          }
          return { theme: newTheme };
        });
      },

      // Catálogo
      setCatalogo: (productos) => set({ productos }),
      setProductoSeleccionado: (producto) => set({ productoSeleccionado: producto }),
      setCatalogoLoading: (loading) => set({ catalogoLoading: loading }),
      setCatalogoError: (error) => set({ catalogoError: error }),

      // Pedido
      toggleMostrarCostos: () => set((state) => ({ mostrarCostos: !state.mostrarCostos })),

      agregarItemPedido: (producto, cantidad, porcentaje) => {
        const state = get();
        // El precio unitario final es el costo del distribuidor + porcentaje de ganancia
        const precioUnitarioFinal = calcularPrecioFinal(producto.precioCosto, porcentaje);
        const subtotal = calcularSubtotal(precioUnitarioFinal, cantidad);

        const itemExistente = state.pedidoActual.items.find(
          (item) => item.producto.codigo === producto.codigo
        );

        let nuevosItems: ItemPedido[];

        if (itemExistente) {
          // Actualizar ítem existente
          nuevosItems = state.pedidoActual.items.map((item) =>
            item.producto.codigo === producto.codigo
              ? {
                  ...item,
                  cantidad,
                  coeficientePorcentaje: porcentaje,
                  precioUnitarioFinal,
                  subtotal,
                }
              : item
          );
        } else {
          // Agregar nuevo ítem
          const nuevoItem: ItemPedido = {
            producto,
            cantidad,
            coeficientePorcentaje: porcentaje,
            precioUnitarioFinal,
            subtotal,
          };
          nuevosItems = [...state.pedidoActual.items, nuevoItem];
        }

        const total = nuevosItems.reduce((sum, item) => sum + item.subtotal, 0);

        set({
          pedidoActual: {
            ...state.pedidoActual,
            items: nuevosItems,
            total,
          },
        });
      },

      actualizarItemPedido: (codigoProducto, cantidad, porcentaje) => {
        set((state) => {
          const itemsActualizados = state.pedidoActual.items.map((item) => {
            if (item.producto.codigo === codigoProducto) {
              // El precio unitario final es el costo del distribuidor + porcentaje de ganancia
              const precioUnitarioFinal = calcularPrecioFinal(
                item.producto.precioCosto,
                porcentaje
              );
              const subtotal = calcularSubtotal(precioUnitarioFinal, cantidad);
              return {
                ...item,
                cantidad,
                coeficientePorcentaje: porcentaje,
                precioUnitarioFinal,
                subtotal,
              };
            }
            return item;
          });

          const total = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0);

          return {
            pedidoActual: {
              ...state.pedidoActual,
              items: itemsActualizados,
              total,
            },
          };
        });
      },

      eliminarItemPedido: (codigoProducto) => {
        set((state) => {
          const itemsFiltrados = state.pedidoActual.items.filter(
            (item) => item.producto.codigo !== codigoProducto
          );
          const total = itemsFiltrados.reduce((sum, item) => sum + item.subtotal, 0);

          return {
            pedidoActual: {
              ...state.pedidoActual,
              items: itemsFiltrados,
              total,
            },
          };
        });
      },

      vaciarPedido: () => {
        set({ pedidoActual: crearPedidoVacio() });
      },

      calcularTotalPedido: () => {
        set((state) => {
          const total = state.pedidoActual.items.reduce((sum, item) => sum + item.subtotal, 0);
          return {
            pedidoActual: {
              ...state.pedidoActual,
              total,
            },
          };
        });
      },

      // Pedidos guardados
      guardarPedido: (pedido) => {
        set((state) => ({
          pedidosGuardados: [pedido, ...state.pedidosGuardados.slice(0, 19)], // Mantener últimos 20
        }));
      },

      cargarPedido: (pedidoId) => {
        const state = get();
        const pedido = state.pedidosGuardados.find((p) => p.id === pedidoId);
        if (pedido) {
          set({ pedidoActual: { ...pedido, id: crypto.randomUUID() } });
        }
      },

      duplicarPedido: (pedidoId) => {
        const state = get();
        const pedido = state.pedidosGuardados.find((p) => p.id === pedidoId);
        if (pedido) {
          const nuevoPedido = {
            ...pedido,
            id: crypto.randomUUID(),
            fecha: new Date().toISOString(),
          };
          set({ pedidoActual: nuevoPedido });
        }
      },

      eliminarPedidoGuardado: (pedidoId) => {
        set((state) => ({
          pedidosGuardados: state.pedidosGuardados.filter((p) => p.id !== pedidoId),
        }));
      },
    }),
    {
      name: 'casa-fabio-store',
      partialize: (state) => ({
        theme: state.theme,
        pedidosGuardados: state.pedidosGuardados,
      }),
    }
  )
);
