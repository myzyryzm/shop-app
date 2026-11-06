import type { Product } from "../api/types";
import { useSession } from "../state/SessionContext";

export function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/**
 * Guests see the list price with a hint about the member price.
 * Members see their price with the list price struck through.
 */
export function PriceTag({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const { isMember } = useSession();
  const hasMemberSaving = product.memberPrice < product.listPrice;

  if (isMember) {
    return (
      <div className={`price price-${size}`}>
        <span className="price-label">Your price</span>
        <span className="price-value">{money(product.memberPrice)}</span>
        {hasMemberSaving && <span className="price-strike">{money(product.listPrice)}</span>}
      </div>
    );
  }

  return (
    <div className={`price price-${size}`}>
      <span className="price-label">Price</span>
      <span className="price-value">{money(product.listPrice)}</span>
      {hasMemberSaving && <span className="price-hint">Members pay {money(product.memberPrice)}</span>}
    </div>
  );
}
