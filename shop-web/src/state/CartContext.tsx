import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { Cart } from "../api/types";
import { useSession } from "./SessionContext";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  itemCount: number;
}

const CartCtx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { region, isMember } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setCart(await api.cart({ region, isMember }));
    } finally {
      setLoading(false);
    }
  }, [region, isMember]);

  // Prices in the cart depend on member status, so re-fetch whenever it changes.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (productId: string, quantity: number) => {
      setCart(await api.addToCart({ region, isMember }, productId, quantity));
    },
    [region, isMember],
  );

  const remove = useCallback(
    async (productId: string) => {
      setCart(await api.removeFromCart({ region, isMember }, productId));
    },
    [region, isMember],
  );

  const value = useMemo<CartState>(
    () => ({
      cart,
      loading,
      refresh,
      add,
      remove,
      itemCount: cart?.lines.reduce((n, l) => n + l.quantity, 0) ?? 0,
    }),
    [cart, loading, refresh, add, remove],
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
