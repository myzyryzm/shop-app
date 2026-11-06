import type { Request } from "express";
import { config } from "./config.js";

export const SUPPORTED_REGIONS = ["US", "CA", "EU", "UK"] as const;
export type Region = (typeof SUPPORTED_REGIONS)[number];

export function isRegion(value: string): value is Region {
  return (SUPPORTED_REGIONS as readonly string[]).includes(value);
}

/**
 * The buyer's region comes from the X-Buyer-Region header. Unknown or missing
 * values fall back to the configured default region rather than failing the
 * request, so an anonymous shopper always sees *some* catalog.
 */
export function resolveRegion(req: Request): Region {
  const header = req.header("x-buyer-region");
  const candidate = (header ?? "").trim().toUpperCase();
  if (isRegion(candidate)) return candidate;
  const fallback = config.defaultRegion.toUpperCase();
  return isRegion(fallback) ? fallback : "US";
}

export function isMemberRequest(req: Request): boolean {
  return (req.header("x-member") ?? "").trim().toLowerCase() === "true";
}
