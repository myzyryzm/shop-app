import type { Product } from "../api/types";

interface Props {
  product: Product;
  label: string;
  variant?: "primary" | "secondary";
  busy?: boolean;
  onClick: () => void;
}

/**
 * Both "Add to cart" and "Buy Now" render through this. When the catalog says
 * the item isn't purchasable the button is disabled and relabelled; the
 * storefront doesn't know (or say) why.
 */
export function BuyButton({ product, label, variant = "primary", busy = false, onClick }: Props) {
  const disabled = !product.purchasable || busy;
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
      title={product.purchasable ? undefined : "This item can't be purchased right now."}
    >
      {product.purchasable ? label : "Currently unavailable"}
    </button>
  );
}
