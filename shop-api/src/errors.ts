import type { ErrorRequestHandler } from "express";

export type ErrorCode =
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "SESSION_REQUIRED"
  | "ITEM_UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "INSUFFICIENT_STOCK"
  | "REGION_RESTRICTED"
  | "EMPTY_CART";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly productId?: string,
  ) {
    super(message);
  }

  toBody() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.productId ? { productId: this.productId } : {}),
      },
    };
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json(err.toBody());
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Unexpected error" } });
};
