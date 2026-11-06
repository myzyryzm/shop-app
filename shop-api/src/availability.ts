import type { Product } from "./products.js";
import type { Region } from "./regions.js";

export type AvailabilityReason = "OUT_OF_STOCK" | "REGION_RESTRICTED";

/**
 * Why a product cannot be sold to a buyer in `region`, or null when it can.
 * Stock is checked before region so a product that fails both reports
 * OUT_OF_STOCK.
 *
 * This reason is used for checkout error codes and never leaves the backend
 * in catalog responses; the storefront only receives the boolean from
 * `isPurchasable`.
 */
export function availabilityReason(product: Product, region: Region): AvailabilityReason | null {
  if (product.stock < 1) return "OUT_OF_STOCK";
  if (product.restrictedRegions.includes(region)) return "REGION_RESTRICTED";
  return null;
}

export function isPurchasable(product: Product, region: Region): boolean {
  return availabilityReason(product, region) === null;
}
