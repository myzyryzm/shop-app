import { Router, type Request } from "express";
import { ApiError } from "./errors.js";
import { addLine, removeLine, viewCart } from "./cart.js";
import { placeOrder } from "./checkout.js";
import { getProduct, getProducts } from "./products.js";
import { isMemberRequest, resolveRegion, SUPPORTED_REGIONS } from "./regions.js";
import { toPublicProduct } from "./serialize.js";

export const router = Router();

function requireSession(req: Request): string {
  const sessionId = (req.header("x-session-id") ?? "").trim();
  if (!sessionId) throw new ApiError(400, "SESSION_REQUIRED", "X-Session-Id header is required");
  return sessionId;
}

router.get("/regions", (_req, res) => {
  res.json({ regions: SUPPORTED_REGIONS });
});

router.get("/products", (req, res) => {
  const region = resolveRegion(req);
  res.json({ region, products: getProducts().map((p) => toPublicProduct(p, region)) });
});

router.get("/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found", req.params.id);
  const region = resolveRegion(req);
  res.json({ region, product: toPublicProduct(product, region) });
});

router.get("/cart", (req, res) => {
  const sessionId = requireSession(req);
  res.json(viewCart(sessionId, isMemberRequest(req)));
});

router.post("/cart/items", (req, res) => {
  const sessionId = requireSession(req);
  const { productId, quantity = 1 } = (req.body ?? {}) as { productId?: string; quantity?: number };
  if (!productId) throw new ApiError(400, "BAD_REQUEST", "productId is required");
  addLine(sessionId, productId, Number(quantity), resolveRegion(req));
  res.status(201).json(viewCart(sessionId, isMemberRequest(req)));
});

router.delete("/cart/items/:productId", (req, res) => {
  const sessionId = requireSession(req);
  removeLine(sessionId, req.params.productId);
  res.json(viewCart(sessionId, isMemberRequest(req)));
});

router.post("/checkout", (req, res) => {
  const sessionId = requireSession(req);
  const order = placeOrder(sessionId, resolveRegion(req), isMemberRequest(req));
  res.status(201).json({ order });
});
