# shop-api

Backend for the storefront. Serves the product catalog, a per-session cart, and checkout.

## Run

```bash
npm install
npm run dev        # http://localhost:4000
```

Configuration is read from `env/<STAGE>.yml` (`STAGE` defaults to `local`), then overridden by
environment variables of the same name.

## Test

```bash
npm test
npm run typecheck
```

## Request headers

| Header            | Meaning                                                      |
| ----------------- | ------------------------------------------------------------ |
| `X-Session-Id`    | Identifies the shopper's cart. Required for cart/checkout.   |
| `X-Buyer-Region`  | Shopper's region code. Falls back to the configured default. |
| `X-Member`        | `true` when the shopper is signed in as a member.            |
