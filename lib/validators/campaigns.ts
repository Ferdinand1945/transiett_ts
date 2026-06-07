import type { CreateCampaignInput } from "../types";
import { validationError, type ValidationResult } from "./common";

export function parseCampaignId(id: string): ValidationResult<number> {
  const campaignId = Number(id);
  if (!Number.isFinite(campaignId)) {
    return validationError("Invalid campaign id");
  }
  return { success: true, data: campaignId };
}

export function validateCreateCampaignInput(
  body: unknown,
): ValidationResult<CreateCampaignInput> {
  if (!body || typeof body !== "object") {
    return validationError(
      "prefix, amount, currency, valid_from, valid_to are required",
    );
  }

  const input = body as Record<string, unknown>;
  const prefix = typeof input.prefix === "string" ? input.prefix.trim() : "";
  const currency =
    typeof input.currency === "string" ? input.currency.trim() : "";
  const validFrom =
    typeof input.valid_from === "string" ? input.valid_from : "";
  const validTo = typeof input.valid_to === "string" ? input.valid_to : "";
  const amount = Number(input.amount);

  if (!prefix || !currency || !validFrom || !validTo || !Number.isFinite(amount)) {
    return validationError(
      "prefix, amount, currency, valid_from, valid_to are required",
    );
  }

  if (amount <= 0) {
    return validationError("amount must be greater than 0");
  }

  if (new Date(validFrom) > new Date(validTo)) {
    return validationError("valid_from must be before valid_to");
  }

  return {
    success: true,
    data: {
      prefix,
      amount,
      currency,
      valid_from: validFrom,
      valid_to: validTo,
    },
  };
}
