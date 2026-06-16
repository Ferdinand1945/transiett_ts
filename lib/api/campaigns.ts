import { requestJson } from "./client";
import type {
  Campaign,
  CreateCampaignInput,
  CreateVouchersBatchResult,
  Voucher,
} from "../types";

const CAMPAIGNS_URL = "/api/campaigns";

export type VoucherListResult = {
  vouchers: Voucher[];
  total: number;
};

function campaignUrl(id: number): string {
  return `${CAMPAIGNS_URL}/${id}`;
}

function vouchersUrl(id: number, limit: number, offset: number): string {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return `${campaignUrl(id)}/vouchers?${params}`;
}

export function fetchCampaigns(): Promise<Campaign[]> {
  return requestJson<Campaign[]>(CAMPAIGNS_URL);
}

export function fetchVouchers(
  campaignId: number,
  limit = 100,
  offset = 0,
): Promise<VoucherListResult> {
  return requestJson<VoucherListResult>(vouchersUrl(campaignId, limit, offset));
}

export function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  return requestJson<Campaign>(CAMPAIGNS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteCampaign(campaignId: number): Promise<{ ok: true }> {
  return requestJson<{ ok: true }>(campaignUrl(campaignId), {
    method: "DELETE",
  });
}

export function createVouchersBatch(
  campaignId: number,
  count: number,
): Promise<CreateVouchersBatchResult> {
  return requestJson<CreateVouchersBatchResult>(
    `${campaignUrl(campaignId)}/vouchers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    },
  );
}

export function vouchersExportUrl(campaignId: number): string {
  return `${campaignUrl(campaignId)}/vouchers/export`;
}
