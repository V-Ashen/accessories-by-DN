import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  cart: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number; // Subtotal of items
  deliveryCharge: () => number; // NEW: Calculates delivery
  grandTotal: () => number; // NEW: Subtotal + Delivery
}

const FREE_DELIVERY_THRESHOLD = 3000; // LKR
const STANDARD_DELIVERY_CHARGE = 350; // LKR

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  isCartOpen: false,
  
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

  addToCart: (product) => {
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity < product.stockQuantity) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            isCartOpen: true,
          };
        }
        alert("Maximum stock reached for this item!");
        return state;
      }
      
      return {
        cart: [
          ...state.cart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            maxStock: product.stockQuantity,
            quantity: 1,
          },
        ],
        isCartOpen: true,
      };
    });
  },

  removeFromCart: (id) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id 
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock)) } 
          : item
      ),
    }));
  },

  clearCart: () => set({ cart: [] }),

  cartTotal: () => {
    return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  // NEW: Calculate Delivery Charge
  deliveryCharge: () => {
    const subtotal = get().cartTotal();
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_CHARGE;
  },

  // NEW: Calculate Grand Total
  grandTotal: () => {
    return get().cartTotal() + get().deliveryCharge();
  },
}));