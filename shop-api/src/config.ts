import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

export interface Config {
  port: number;
  /** Region assumed when a request carries no X-Buyer-Region header. */
  defaultRegion: string;
  /** Stock at or below this value is reported to the storefront as "low". */
  lowStockThreshold: number;
  /** Subtotal (effective prices) at or above this value ships free. */
  freeShippingThreshold: number;
  flatShippingFee: number;
}

type RawConfig = Record<string, string | number | undefined>;

function loadStageFile(stage: string): RawConfig {
  const path = resolve(process.cwd(), "env", `${stage}.yml`);
  if (!existsSync(path)) return {};
  return (parse(readFileSync(path, "utf8")) ?? {}) as RawConfig;
}

function pick(raw: RawConfig, key: string, fallback: number | string): number | string {
  const fromEnv = process.env[key];
  if (fromEnv !== undefined && fromEnv !== "") return fromEnv;
  const fromFile = raw[key];
  if (fromFile !== undefined) return fromFile;
  return fallback;
}

export function loadConfig(stage = process.env.STAGE ?? "local"): Config {
  const raw = loadStageFile(stage);
  return {
    port: Number(pick(raw, "PORT", 4000)),
    defaultRegion: String(pick(raw, "DEFAULT_REGION", "US")),
    lowStockThreshold: Number(pick(raw, "LOW_STOCK_THRESHOLD", 3)),
    freeShippingThreshold: Number(pick(raw, "FREE_SHIPPING_THRESHOLD", 75)),
    flatShippingFee: Number(pick(raw, "FLAT_SHIPPING_FEE", 6.99)),
  };
}

export const config: Config = loadConfig();
