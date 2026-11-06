import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Region } from "./regions.js";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  /** Price shown to and charged for guests. */
  listPrice: number;
  /** Price charged to signed-in members. Never higher than listPrice. */
  memberPrice: number;
  stock: number;
  /** Regions this product may not be sold into (regulatory / shipping limits). */
  restrictedRegions: Region[];
}

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = join(here, "data", "products.json");

let store: Map<string, Product> = load();

function load(): Map<string, Product> {
  const seed = JSON.parse(readFileSync(seedPath, "utf8")) as Product[];
  return new Map(seed.map((p) => [p.id, { ...p }]));
}

export function getProducts(): Product[] {
  return [...store.values()];
}

export function getProduct(id: string): Product | undefined {
  return store.get(id);
}

export function decrementStock(id: string, qty: number): void {
  const product = store.get(id);
  if (!product) throw new Error(`Unknown product ${id}`);
  if (product.stock < qty) throw new Error(`Stock underflow for ${id}`);
  product.stock -= qty;
}

/** Test helper: restore the seed catalog. */
export function resetProducts(): void {
  store = load();
}
