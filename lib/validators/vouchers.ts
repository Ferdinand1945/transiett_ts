import { validationError, type ValidationResult } from "./common";

export const DEFAULT_VOUCHER_LIMIT = 100;
export const MAX_VOUCHER_LIMIT = 500;
export const MAX_BATCH_VOUCHER_COUNT = 200_000;

export function validateVoucherListQuery(
  searchParams: URLSearchParams,
): ValidationResult<{ limit: number; offset: number }> {
  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");
  const parsedLimit = Number(limitRaw ?? DEFAULT_VOUCHER_LIMIT);
  const parsedOffset = Number(offsetRaw ?? 0);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return validationError("limit must be a positive number");
  }

  if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
    return validationError("offset must be a non-negative number");
  }

  const limit = Math.min(parsedLimit, MAX_VOUCHER_LIMIT);
  const offset = parsedOffset;

  return { success: true, data: { limit, offset } };
}

export function validateBatchVoucherCount(
  body: unknown,
): ValidationResult<number> {
  if (!body || typeof body !== "object") {
    return validationError("count must be between 1 and 200000");
  }

  const count = Number((body as { count?: unknown }).count);
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > MAX_BATCH_VOUCHER_COUNT
  ) {
    return validationError("count must be between 1 and 200000");
  }

  return { success: true, data: count };
}
