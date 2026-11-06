import { Link } from "react-router-dom";
import type { Product } from "../api/types";
import { PriceTag } from "./PriceTag";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className={`card ${product.purchasable ? "" : "card-unavailable"}`}>
      <div className="card-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {!product.purchasable && <span className="pill pill-muted">Unavailable</span>}
        {product.purchasable && product.lowStock && <span className="pill pill-warn">Only a few left</span>}
      </div>
      <div className="card-body">
        <span className="card-category">{product.category}</span>
        <h3 className="card-title">{product.name}</h3>
        <PriceTag product={product} />
      </div>
    </Link>
  );
}
