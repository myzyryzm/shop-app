import { config } from "./config.js";
import { isPurchasable } from "./availability.js";
import type { Product } from "./products.js";
import type { Region } from "./regions.js";

/** The product shape the storefront receives. */
export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  listPrice: number;
  memberPrice: number;
  /** Whether this buyer can add the item to a cart right now. */
  purchasable: boolean;
  /** True when remaining stock is at or below the configured low-stock threshold. */
  lowStock: boolean;
}

/**
 * Builds the catalog view of a product for one buyer. Stock counts and
 * regional restrictions are collapsed into `purchasable` / `lowStock`; the
 * raw values are not exposed.
 */
export function toPublicProduct(product: Product, region: Region): PublicProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    image: product.image,
    listPrice: product.listPrice,
    memberPrice: product.memberPrice,
    purchasable: isPurchasable(product, region),
    lowStock: product.stock > 0 && product.stock <= config.lowStockThreshold,
  };
}
