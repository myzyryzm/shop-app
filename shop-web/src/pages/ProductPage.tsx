import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Product } from "../api/types";
import { BuyButton } from "../components/BuyButton";
import { PriceTag } from "../components/PriceTag";
import { Toast, type ToastMessage } from "../components/Toast";
import { useCart } from "../state/CartContext";
import { useSession } from "../state/SessionContext";

export function ProductPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { region, isMember } = useSession();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismiss = useCallback(() => setToast(null), []);

  useEffect(() => {
    let cancelled = false;
    api
      .product({ region, isMember }, id)
      .then((res) => !cancelled && setProduct(res.product))
      .catch(() => !cancelled && setNotFound(true));
    return () => {
      cancelled = true;
    };
  }, [id, region, isMember]);

  async function addToCart(): Promise<boolean> {
    if (!product) return false;
    setBusy(true);
    try {
      await add(product.id, qty);
      return true;
    } catch {
      setToast({ kind: "error", text: "We couldn't add that item to your cart." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    if (await addToCart()) setToast({ kind: "success", text: "Added to your cart." });
  }

  async function handleBuyNow() {
    if (await addToCart()) navigate("/cart");
  }

  if (notFound) {
    return (
      <p className="notice">
        We couldn't find that product. <Link to="/">Back to the catalog</Link>
      </p>
    );
  }
  if (!product) return <p className="notice">Loading…</p>;

  return (
    <section className="product">
      <Link to="/" className="back">
        ← All products
      </Link>
      <div className="product-layout">
        <div className="product-media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-info">
          <span className="card-category">{product.category}</span>
          <h1>{product.name}</h1>
          <PriceTag product={product} size="lg" />
          <p className="product-description">{product.description}</p>

          {product.purchasable && product.lowStock && <p className="stock-note">Only a few left in stock.</p>}
          {!product.purchasable && (
            <p className="stock-note stock-note-muted">This item is currently unavailable.</p>
          )}

          <div className="buy-row">
            <label className="qty">
              <span>Qty</span>
              <input
                type="number"
                min={1}
                max={10}
                value={qty}
                disabled={!product.purchasable}
                onChange={(e) => setQty(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              />
            </label>
            <BuyButton product={product} label="Add to cart" variant="secondary" busy={busy} onClick={handleAdd} />
            <BuyButton product={product} label="Buy Now" busy={busy} onClick={handleBuyNow} />
          </div>
        </div>
      </div>
      <Toast message={toast} onDismiss={dismiss} />
    </section>
  );
}
