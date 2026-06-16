import type { CreateCampaignInput } from "../types";
import { validationError, type ValidationResult } from "./common";

export function parseCampaignId(id: string): ValidationResult<number> {
  const campaignId = Number(id);
  if (!Number.isInteger(campaignId) || campaignId < 1) {
    return validationError("Invalid campaign id");
  }
  return { success: true, data: campaignId };
}
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
    typeof input.valid_from === "string" ? input.valid_from.trim() : "";
  const validTo =
    typeof input.valid_to === "string" ? input.valid_to.trim() : "";
  const amount = Number(input.amount);

  if (!prefix || !currency || !validFrom || !validTo || !Number.isFinite(amount)) {
    return validationError(
      "prefix, amount, currency, valid_from, valid_to are required",
    );
  }

  if (amount <= 0) {
    return validationError("amount must be greater than 0");
  }

  const validFromTs = Date.parse(validFrom);
  const validToTs = Date.parse(validTo);
  if (!Number.isFinite(validFromTs) || !Number.isFinite(validToTs)) {
    return validationError("valid_from and valid_to must be valid dates");
  }

  if (validFromTs > validToTs) {
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
