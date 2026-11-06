import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Product } from "../api/types";
import { ProductCard } from "../components/ProductCard";
import { useSession } from "../state/SessionContext";

export function CatalogPage() {
  const { region, isMember } = useSession();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    api
      .products({ region, isMember })
      .then((res) => !cancelled && setProducts(res.products))
      .catch(() => !cancelled && setError("We couldn't load the catalog."));
    return () => {
      cancelled = true;
    };
  }, [region, isMember]);

  if (error) return <p className="notice notice-error">{error}</p>;
  if (!products) return <p className="notice">Loading catalog…</p>;

  return (
    <section>
      <h1 className="page-title">Gear for the long way round</h1>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
