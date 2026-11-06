import { ApiError } from "./errors.js";
import { isPurchasable } from "./availability.js";
import { getProduct } from "./products.js";
import { computeTotals, priceLine, type PricedLine, type Totals } from "./pricing.js";
import type { Region } from "./regions.js";

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartView {
  sessionId: string;
  lines: PricedLine[];
  totals: Totals;
}

const carts = new Map<string, CartLine[]>();

export function getLines(sessionId: string): CartLine[] {
  return carts.get(sessionId) ?? [];
}

/**
 * Adding to the cart is gated on the same availability check as the catalog,
 * so a buyer cannot cart an item the storefront shows as unavailable by
 * crafting the request directly.
 */
export function addLine(sessionId: string, productId: string, quantity: number, region: Region): CartLine[] {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, "BAD_REQUEST", "quantity must be a positive integer");
  }
  const product = getProduct(productId);
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found", productId);
  if (!isPurchasable(product, region)) {
    throw new ApiError(409, "ITEM_UNAVAILABLE", "This item cannot be added to your cart", productId);
  }
  const lines = [...getLines(sessionId)];
  const existing = lines.find((l) => l.productId === productId);
  if (existing) existing.quantity += quantity;
  else lines.push({ productId, quantity });
  carts.set(sessionId, lines);
  return lines;
}

export function removeLine(sessionId: string, productId: string): CartLine[] {
  const lines = getLines(sessionId).filter((l) => l.productId !== productId);
  carts.set(sessionId, lines);
  return lines;
}

export function clearCart(sessionId: string): void {
  carts.delete(sessionId);
}

export function viewCart(sessionId: string, isMember: boolean): CartView {
  const lines = getLines(sessionId).flatMap((line) => {
    const product = getProduct(line.productId);
    return product ? [priceLine(product, line.quantity, isMember)] : [];
  });
  return { sessionId, lines, totals: computeTotals(lines, isMember) };
}

/** Test helper. */
export function resetCarts(): void {
  carts.clear();
}
