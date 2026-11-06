export type Region = "US" | "CA" | "EU" | "UK";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  listPrice: number;
  memberPrice: number;
  purchasable: boolean;
  lowStock: boolean;
}

export interface CartLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Totals {
  subtotal: number;
  shipping: number;
  total: number;
  priceSource: "member" | "list";
}

export interface Cart {
  sessionId: string;
  lines: CartLine[];
  totals: Totals;
}

export interface Order {
  id: string;
  region: Region;
  lines: CartLine[];
  totals: Totals;
  placedAt: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string; productId?: string };
}
