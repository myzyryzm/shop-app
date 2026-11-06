import { describe, expect, it } from "vitest";
import { availabilityReason, isPurchasable } from "../src/availability.js";
import type { Product } from "../src/products.js";

const base: Product = {
  id: "p-test",
  slug: "test",
  name: "Test",
  category: "gear",
  description: "",
  image: "",
  listPrice: 10,
  memberPrice: 8,
  stock: 5,
  restrictedRegions: ["EU"],
};

describe("availability", () => {
  it("is purchasable with stock in an unrestricted region", () => {
    expect(isPurchasable(base, "US")).toBe(true);
    expect(availabilityReason(base, "US")).toBeNull();
  });

  it("refuses when stock is below 1", () => {
    expect(availabilityReason({ ...base, stock: 0 }, "US")).toBe("OUT_OF_STOCK");
    expect(isPurchasable({ ...base, stock: 0 }, "US")).toBe(false);
  });

  it("refuses restricted regions", () => {
    expect(availabilityReason(base, "EU")).toBe("REGION_RESTRICTED");
    expect(isPurchasable(base, "EU")).toBe(false);
  });

  it("reports out of stock ahead of region restriction", () => {
    expect(availabilityReason({ ...base, stock: 0 }, "EU")).toBe("OUT_OF_STOCK");
  });
});
