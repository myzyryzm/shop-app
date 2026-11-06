import { randomUUID } from "node:crypto";
import { ApiError } from "./errors.js";
import { availabilityReason } from "./availability.js";
import { clearCart, getLines } from "./cart.js";
import { decrementStock, getProduct } from "./products.js";
import { computeTotals, priceLine, type PricedLine, type Totals } from "./pricing.js";
import type { Region } from "./regions.js";

export interface Order {
  id: string;
  sessionId: string;
  region: Region;
  lines: PricedLine[];
  totals: Totals;
  placedAt: string;
}

const orders: Order[] = [];

/**
 * Converts the session's cart into an order.
 *
 * Every line is re-validated against *current* stock and the buyer's region
 * at the moment of checkout, regardless of what the storefront showed when
 * the item was carted. The first failing line aborts the whole checkout:
 *   - stock < 1            → 409 OUT_OF_STOCK
 *   - stock < quantity     → 409 INSUFFICIENT_STOCK
 *   - region restricted    → 403 REGION_RESTRICTED
 * Nothing is decremented until every line has passed.
 */
export function placeOrder(sessionId: string, region: Region, isMember: boolean): Order {
  const cartLines = getLines(sessionId);
  if (cartLines.length === 0) throw new ApiError(400, "EMPTY_CART", "Your cart is empty");

  const priced: PricedLine[] = [];
  for (const line of cartLines) {
    const product = getProduct(line.productId);
    if (!product) throw new ApiError(404, "NOT_FOUND", "Product no longer exists", line.productId);

    const reason = availabilityReason(product, region);
    if (reason === "OUT_OF_STOCK") {
      throw new ApiError(409, "OUT_OF_STOCK", `${product.name} is out of stock`, product.id);
    }
    if (reason === "REGION_RESTRICTED") {
      throw new ApiError(403, "REGION_RESTRICTED", `${product.name} cannot be shipped to ${region}`, product.id);
    }
    if (product.stock < line.quantity) {
      throw new ApiError(
        409,
        "INSUFFICIENT_STOCK",
        `Only ${product.stock} of ${product.name} available`,
        product.id,
      );
    }
    priced.push(priceLine(product, line.quantity, isMember));
  }

  for (const line of cartLines) decrementStock(line.productId, line.quantity);

  const order: Order = {
    id: `ord_${randomUUID().slice(0, 8)}`,
    sessionId,
    region,
    lines: priced,
    totals: computeTotals(priced, isMember),
    placedAt: new Date().toISOString(),
  };
  orders.push(order);
  clearCart(sessionId);
  return order;
}

export function listOrders(): Order[] {
  return [...orders];
}

/** Test helper. */
export function resetOrders(): void {
  orders.length = 0;
}
