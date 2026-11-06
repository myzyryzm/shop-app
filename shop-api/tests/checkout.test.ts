import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { resetCarts } from "../src/cart.js";
import { resetOrders } from "../src/checkout.js";
import { getProduct, resetProducts } from "../src/products.js";

const app = createApp();
const SESSION = "sess-test";

function api(region = "US", member = false) {
  const headers: Record<string, string> = { "x-session-id": SESSION, "x-buyer-region": region };
  if (member) headers["x-member"] = "true";
  return {
    add: (productId: string, quantity = 1) =>
      request(app).post("/api/cart/items").set(headers).send({ productId, quantity }),
    cart: () => request(app).get("/api/cart").set(headers),
    checkout: () => request(app).post("/api/checkout").set(headers),
    product: (id: string) => request(app).get(`/api/products/${id}`).set(headers),
  };
}

beforeEach(() => {
  resetProducts();
  resetCarts();
  resetOrders();
});

describe("catalog", () => {
  it("exposes purchasable/lowStock but not raw stock or restrictions", async () => {
    const res = await api("EU").product("p-1002");
    expect(res.status).toBe(200);
    expect(res.body.product.purchasable).toBe(false);
    expect(res.body.product).not.toHaveProperty("stock");
    expect(res.body.product).not.toHaveProperty("restrictedRegions");
  });

  it("flags low stock", async () => {
    const res = await api().product("p-1004");
    expect(res.body.product.lowStock).toBe(true);
    expect(res.body.product.purchasable).toBe(true);
  });

  it("falls back to the default region for unknown headers", async () => {
    const res = await request(app).get("/api/products").set("x-buyer-region", "MARS");
    expect(res.body.region).toBe("US");
  });
});

describe("cart", () => {
  it("refuses to cart an unavailable item", async () => {
    const res = await api("EU").add("p-1002");
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ITEM_UNAVAILABLE");
  });

  it("requires a session", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("SESSION_REQUIRED");
  });
});

describe("checkout", () => {
  it("refuses when stock drops below 1 after carting", async () => {
    await api().add("p-1010"); // stock 1
    // another shopper buys the last unit
    const other = { "x-session-id": "other", "x-buyer-region": "US" };
    await request(app).post("/api/cart/items").set(other).send({ productId: "p-1010", quantity: 1 });
    await request(app).post("/api/checkout").set(other).expect(201);

    const res = await api().checkout();
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: "OUT_OF_STOCK", productId: "p-1010" });
  });

  it("refuses insufficient quantity", async () => {
    await api().add("p-1004", 5); // stock 2
    const res = await api().checkout();
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("refuses restricted regions even if the item was carted elsewhere", async () => {
    await api("US").add("p-1002");
    const res = await api("EU").checkout();
    expect(res.status).toBe(403);
    expect(res.body.error).toMatchObject({ code: "REGION_RESTRICTED", productId: "p-1002" });
    expect(getProduct("p-1002")!.stock).toBe(40);
  });

  it("charges member price to members and list price to guests", async () => {
    await api().add("p-1001", 2);
    const guest = await api("US", false).cart();
    const member = await api("US", true).cart();
    expect(guest.body.totals).toMatchObject({ subtotal: 258, priceSource: "list" });
    expect(member.body.totals).toMatchObject({ subtotal: 218, priceSource: "member" });

    const order = await api("US", true).checkout();
    expect(order.status).toBe(201);
    expect(order.body.order.totals.total).toBe(218);
  });

  it("adds flat shipping under the free-shipping threshold", async () => {
    await api().add("p-1012"); // 42
    const res = await api().cart();
    expect(res.body.totals).toMatchObject({ subtotal: 42, shipping: 6.99, total: 48.99 });
  });

  it("decrements stock and clears the cart on success", async () => {
    await api().add("p-1008", 3);
    const res = await api().checkout();
    expect(res.status).toBe(201);
    expect(getProduct("p-1008")!.stock).toBe(9);
    const cart = await api().cart();
    expect(cart.body.lines).toEqual([]);
  });

  it("rejects an empty cart", async () => {
    const res = await api().checkout();
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("EMPTY_CART");
  });
});
