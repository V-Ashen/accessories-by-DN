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
  isCartOpen: boolean; // NEW
  setCartOpen: (isOpen: boolean) => void;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  isCartOpen: false,

  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  
  addToCart: (product) => {
    set((state) => {
      // Check if item is already in cart
      const existingItem = state.cart.find((item) => item.id === product.id);
      
      if (existingItem) {
        // If it exists and we haven't hit stock limit, increase quantity
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
      
      // If new item, add to cart with quantity 1
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

  clearCart: () => set({ cart: [] }),

  cartTotal: () => {
    return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));