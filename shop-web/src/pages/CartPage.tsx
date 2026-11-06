import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Order } from "../api/types";
import { money } from "../components/PriceTag";
import { Toast, type ToastMessage } from "../components/Toast";
import { useCart } from "../state/CartContext";
import { useSession } from "../state/SessionContext";

export function CartPage() {
  const { region, isMember } = useSession();
  const { cart, loading, remove, refresh } = useCart();
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismiss = useCallback(() => setToast(null), []);

  async function placeOrder() {
    setPlacing(true);
    try {
      const res = await api.checkout({ region, isMember });
      setOrder(res.order);
      await refresh();
    } catch {
      // Any failure, whatever the server said, gets the same generic message.
      setToast({ kind: "error", text: "We couldn't complete your order. Please try again later." });
    } finally {
      setPlacing(false);
    }
  }

  if (order) {
    return (
      <section className="confirmation">
        <h1>Thanks for your order!</h1>
        <p>
          Order <strong>{order.id}</strong> is confirmed and will ship to your {order.region} address.
        </p>
        <ul className="confirmation-lines">
          {order.lines.map((l) => (
            <li key={l.productId}>
              {l.quantity} × {l.name} <span>{money(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <p className="confirmation-total">
          Total paid <strong>{money(order.totals.total)}</strong>
        </p>
        <Link to="/" className="btn btn-primary">
          Keep shopping
        </Link>
      </section>
    );
  }

  if (loading && !cart) return <p className="notice">Loading your cart…</p>;
  if (!cart || cart.lines.length === 0) {
    return (
      <section>
        <h1 className="page-title">Your cart</h1>
        <p className="notice">
          Your cart is empty. <Link to="/">Find something good</Link>
        </p>
      </section>
    );
  }

  const { totals } = cart;
  return (
    <section className="cart">
      <h1 className="page-title">Your cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>{totals.priceSource === "member" ? "Your price" : "Price"}</th>
            <th>Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cart.lines.map((l) => (
            <tr key={l.productId}>
              <td>
                <Link to={`/products/${l.productId}`}>{l.name}</Link>
              </td>
              <td>{l.quantity}</td>
              <td>{money(l.unitPrice)}</td>
              <td>{money(l.lineTotal)}</td>
              <td>
                <button className="link-btn" onClick={() => remove(l.productId)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals">
        <div>
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        <div>
          <span>Shipping</span>
          <span>{totals.shipping === 0 ? "Free" : money(totals.shipping)}</span>
        </div>
        <div className="totals-grand">
          <span>Total</span>
          <span>{money(totals.total)}</span>
        </div>
        {totals.priceSource === "member" && <p className="totals-note">Member pricing applied.</p>}
        <button className="btn btn-primary btn-block" disabled={placing} onClick={placeOrder}>
          {placing ? "Placing order…" : "Place order"}
        </button>
      </div>
      <Toast message={toast} onDismiss={dismiss} />
    </section>
  );
}
