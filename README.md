# shop-app

A small storefront for **Summit Supply**: a product catalog, product detail pages, a
per-session cart and checkout. It has two parts:

| Folder                   | What it is                                    | Stack                     | Dev URL                 |
| ------------------------ | --------------------------------------------- | ------------------------- | ----------------------- |
| [`shop-api/`](shop-api/) | Backend: catalog, cart and checkout endpoints | Node, Express 5, TypeScript | http://localhost:4000 |
| [`shop-web/`](shop-web/) | Frontend: the storefront UI                    | React 18, Vite, TypeScript  | http://localhost:5173 |

## Example project for pm-doc-generator

This app is the example project for
[pm-doc-generator](https://github.com/myzyryzm/pm-doc-generator), a tool that reads an
app's code and writes plain-language product documents that answer a product manager's
questions about it.

It is deliberately small but has real product rules spread across both the frontend and
the backend, so a generated document has something to explain. For example:

- **Member pricing.** Signed-in members pay the member price and everyone else pays
  the list price. Promotions do not stack on top of member pricing.
- **Regional availability.** Some products cannot be sold in some regions (US, CA, EU,
  UK). An unknown or missing region falls back to the configured default.
- **Stock.** Stock at or below a threshold is shown as "low". An out-of-stock product
  cannot be bought.
- **Shipping.** Orders at or above a subtotal threshold ship free. Other orders pay a
  flat fee.
- **Per-stage config.** Thresholds and fees differ between `local` and production
  (`shop-api/env/*.yml`).

To use it with pm-doc-generator, set `PROJECT_FOLDER` to this folder and list
`shop-api` and `shop-web` as the repos in the project config.

## Run locally

Start the API first, because the web dev server proxies `/api` to it.

```bash
# terminal 1
cd shop-api
npm install
npm run dev        # http://localhost:4000

# terminal 2
cd shop-web
npm install
npm run dev        # http://localhost:5173
```

## Checks

```bash
cd shop-api && npm test && npm run typecheck
cd shop-web && npm run typecheck && npm run build
```

## How the parts talk

All API routes are mounted under `/api` (`shop-api/src/routes.ts`). The frontend's HTTP
client is `shop-web/src/api/client.ts`. Shopper context is passed in request headers:

| Header           | Meaning                                                      |
| ---------------- | ------------------------------------------------------------ |
| `X-Session-Id`   | Identifies the shopper's cart. Required for cart/checkout.   |
| `X-Buyer-Region` | Shopper's region code. Falls back to the configured default. |
| `X-Member`       | `true` when the shopper is signed in as a member.            |

See [`shop-api/README.md`](shop-api/README.md) and [`shop-web/README.md`](shop-web/README.md)
for more on each part.
