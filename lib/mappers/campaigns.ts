import type { CampaignModel } from "../models/Campaign";
import type { VoucherModel } from "../models/Voucher";
import type { Campaign, Voucher } from "../types";

export function toCampaign(row: CampaignModel): Campaign {
  const voucherCount = row.get("voucher_count");
  return {
    id: row.id,
    prefix: row.prefix,
    amount: String(row.amount),
    currency: row.currency,
    valid_from: formatDate(row.valid_from),
    valid_to: formatDate(row.valid_to),
    created_at: formatDateTime(row.created_at),
    voucher_count: Number(voucherCount ?? 0),
  };
}

export function toVoucher(row: VoucherModel): Voucher {
  return {
    id: Number(row.id),
    campaign_id: row.campaign_id,
    code: row.code,
    created_at: formatDateTime(row.created_at),
  };
}

function formatDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function formatDateTime(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
