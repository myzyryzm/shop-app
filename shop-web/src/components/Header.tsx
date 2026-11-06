import { Link, NavLink } from "react-router-dom";
import type { Region } from "../api/types";
import { useCart } from "../state/CartContext";
import { REGIONS, useSession } from "../state/SessionContext";

export function Header() {
  const { region, isMember, setRegion, setMember } = useSession();
  const { itemCount } = useCart();

  return (
    <header className="header">
      <Link to="/" className="brand">
        Summit Supply
      </Link>
      <div className="header-controls">
        <label className="control">
          <span>Ship to</span>
          <select value={region} onChange={(e) => setRegion(e.target.value as Region)}>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <button className={`member-toggle ${isMember ? "on" : ""}`} onClick={() => setMember(!isMember)}>
          {isMember ? "Signed in as member" : "Sign in as member"}
        </button>
        <NavLink to="/cart" className="cart-link">
          Cart{itemCount > 0 && <span className="badge">{itemCount}</span>}
        </NavLink>
      </div>
    </header>
  );
}
