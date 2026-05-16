import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  unitPrice: number;
  stock: number;
  quantity: number;
  discount: number;
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discountAmount: number;
  taxRate: number;
  notes: string;
  addItem: (item: Omit<CartItem, 'quantity' | 'discount'>) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setLineDiscount: (productId: string, discount: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscountAmount: (amount: number) => void;
  setTaxRate: (rate: number) => void;
  setNotes: (notes: string) => void;
  clear: () => void;
}

const DEFAULT_TAX_RATE = parseFloat(process.env.NEXT_PUBLIC_IGV || '0.18');

export const useCartStore = create<CartState>((set) => ({
  items: [],
  customerId: null,
  customerName: null,
  discountAmount: 0,
  taxRate: DEFAULT_TAX_RATE,
  notes: '',

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        if (existing.quantity + 1 > item.stock) return state;
        return {
          items: state.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      if (item.stock < 1) return state;
      return { items: [...state.items, { ...item, quantity: 1, discount: 0 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  setQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
          : i,
      ),
    })),

  setLineDiscount: (productId, discount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, discount: Math.max(0, discount) } : i,
      ),
    })),

  setCustomer: (customerId, customerName) => set({ customerId, customerName }),
  setDiscountAmount: (amount) => set({ discountAmount: Math.max(0, amount) }),
  setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),
  setNotes: (notes) => set({ notes }),

  clear: () =>
    set({
      items: [],
      customerId: null,
      customerName: null,
      discountAmount: 0,
      taxRate: DEFAULT_TAX_RATE,
      notes: '',
    }),
}));

export function selectTotals(state: CartState) {
  const subtotal = state.items.reduce(
    (acc, i) => acc + (i.quantity * i.unitPrice - i.discount),
    0,
  );
  const afterDiscount = Math.max(0, subtotal - state.discountAmount);
  const tax = afterDiscount * state.taxRate;
  const total = afterDiscount + tax;
  return { subtotal, afterDiscount, tax, total };
}
