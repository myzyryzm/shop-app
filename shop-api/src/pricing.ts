import { config } from "./config.js";
import type { Product } from "./products.js";

export type PriceSource = "member" | "list";

/**
 * Members are charged the member price; everyone else pays the list price.
 * There is no other discount path: promotions do not stack on top of member
 * pricing, and a member price equal to the list price simply means no member
 * saving on that item.
 */
export function effectivePrice(product: Product, isMember: boolean): number {
  return isMember ? product.memberPrice : product.listPrice;
}

export function priceSource(isMember: boolean): PriceSource {
  return isMember ? "member" : "list";
}

export interface PricedLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Totals {
  subtotal: number;
  shipping: number;
  total: number;
  priceSource: PriceSource;
}

export function priceLine(product: Product, quantity: number, isMember: boolean): PricedLine {
  const unitPrice = effectivePrice(product, isMember);
  return {
    productId: product.id,
    name: product.name,
    quantity,
    unitPrice,
    lineTotal: round(unitPrice * quantity),
  };
}

/** Shipping is free once the subtotal (at effective prices) reaches the threshold. */
export function computeTotals(lines: PricedLine[], isMember: boolean): Totals {
  const subtotal = round(lines.reduce((sum, l) => sum + l.lineTotal, 0));
  const shipping =
    lines.length === 0 || subtotal >= config.freeShippingThreshold ? 0 : config.flatShippingFee;
  return {
    subtotal,
    shipping,
    total: round(subtotal + shipping),
    priceSource: priceSource(isMember),
  };
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}
