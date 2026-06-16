import { Op } from "sequelize";
import { toVoucher } from "../mappers/campaigns";
import { VoucherModel } from "../models";

const INSERT_CHUNK = 5000;

export async function findVouchersByCampaignId(
  campaignId: number,
  limit: number,
  offset: number,
) {
  const { count, rows } = await VoucherModel.findAndCountAll({
    where: { campaign_id: campaignId },
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  return {
    total: count,
    vouchers: rows.map((row) => toVoucher(row)),
  };
}

export async function bulkInsertVoucherCodes(
  campaignId: number,
  codes: string[],
): Promise<number> {
  let inserted = 0;
  for (let i = 0; i < codes.length; i += INSERT_CHUNK) {
    const chunk = codes.slice(i, i + INSERT_CHUNK);
    const rows = await VoucherModel.bulkCreate(
      chunk.map((code) => ({ campaign_id: campaignId, code })),
      { ignoreDuplicates: true },
    );
    inserted += rows.length;
  }
  return inserted;
}

export async function* streamVoucherCodesByCampaignId(
  campaignId: number,
  batchSize = 5000,
): AsyncGenerator<string[]> {
  let lastId = 0;
  while (true) {
    const rows = await VoucherModel.findAll({
      where: { campaign_id: campaignId, id: { [Op.gt]: lastId } },
      attributes: ["id", "code"],
      order: [["id", "ASC"]],
      limit: batchSize,
    });

    if (rows.length === 0) break;
    lastId = Number(rows[rows.length - 1]!.id);
    yield rows.map((row) => row.code);
  }
}
