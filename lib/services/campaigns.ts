import {
  createCampaignRecord,
  findCampaignById,
} from "../repositories/campaigns";
import { bulkInsertVoucherCodes } from "../repositories/vouchers";
import { generateUniqueCodes } from "../voucher-codes";
import type {
  Campaign,
  CreateCampaignInput,
  CreateVouchersBatchResult,
} from "../types";

/** Max top-up rounds when DB rejects codes that collide with existing rows */
const MAX_BATCH_ROUNDS = 50;

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<Campaign> {
  const id = await createCampaignRecord({
    prefix: input.prefix.trim().toUpperCase(),
    amount: String(input.amount),
    currency: input.currency.trim().toUpperCase(),
    valid_from: input.valid_from,
    valid_to: input.valid_to,
  });

  const campaign = await findCampaignById(id);
  if (!campaign) throw new Error("Failed to load created campaign");
  return campaign;
}

export async function createVouchersBatch(
  campaignId: number,
  count: number,
): Promise<CreateVouchersBatchResult> {
  const campaign = await findCampaignById(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  let created = 0;
  let rounds = 0;

  while (created < count && rounds < MAX_BATCH_ROUNDS) {
    rounds += 1;
    const remaining = count - created;
    const codes = generateUniqueCodes(campaign.prefix, remaining);
    const inserted = await bulkInsertVoucherCodes(campaignId, codes);
    created += inserted;

    if (inserted === 0) {
      throw new Error(
        `Could not create more unique codes for prefix "${campaign.prefix}". ` +
          `Created ${created} of ${count} requested (code space may be exhausted).`,
      );
    }
  }

  if (created < count) {
    throw new Error(
      `Created ${created} of ${count} requested vouchers after ${MAX_BATCH_ROUNDS} top-up rounds.`,
    );
  }

  return { created, requested: count, complete: true };
}
