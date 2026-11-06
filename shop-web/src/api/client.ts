import type { Cart, Order, Product, Region } from "./types";

const SESSION_KEY = "shop.sessionId";

function sessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export interface ShopperContext {
  region: Region;
  isMember: boolean;
}

export class ApiRequestError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
  }
}

async function call<T>(ctx: ShopperContext, path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Session-Id": sessionId(),
    "X-Buyer-Region": ctx.region,
  };
  if (ctx.isMember) headers["X-Member"] = "true";

  const res = await fetch(`/api${path}`, { ...init, headers });
  if (!res.ok) {
    let code = "UNKNOWN";
    let message = res.statusText;
    try {
      const body = await res.json();
      code = body?.error?.code ?? code;
      message = body?.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiRequestError(res.status, code, message);
  }
  return (await res.json()) as T;
}

export const api = {
  products: (ctx: ShopperContext) =>
    call<{ region: Region; products: Product[] }>(ctx, "/products"),
  product: (ctx: ShopperContext, id: string) =>
    call<{ region: Region; product: Product }>(ctx, `/products/${id}`),
  cart: (ctx: ShopperContext) => call<Cart>(ctx, "/cart"),
  addToCart: (ctx: ShopperContext, productId: string, quantity: number) =>
    call<Cart>(ctx, "/cart/items", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  removeFromCart: (ctx: ShopperContext, productId: string) =>
    call<Cart>(ctx, `/cart/items/${productId}`, { method: "DELETE" }),
  checkout: (ctx: ShopperContext) => call<{ order: Order }>(ctx, "/checkout", { method: "POST" }),
};
