import { col, fn } from "sequelize";
import { toCampaign } from "../mappers/campaigns";
import { CampaignModel, VoucherModel } from "../models";
import type { Campaign } from "../types";

export type CampaignRecord = {
  prefix: string;
  amount: string;
  currency: string;
  valid_from: string;
  valid_to: string;
};

export async function findAllCampaigns(): Promise<Campaign[]> {
  const rows = await CampaignModel.findAll({
    attributes: {
      include: [[fn("COUNT", col("vouchers.id")), "voucher_count"]],
    },
    include: [{ model: VoucherModel, as: "vouchers", attributes: [] }],
    group: [col("campaign.id")],
    order: [["created_at", "DESC"]],
    subQuery: false,
  });

  return rows.map((row) => toCampaign(row));
}

export async function findCampaignById(id: number): Promise<Campaign | null> {
  const row = await CampaignModel.findOne({
    where: { id },
    attributes: {
      include: [[fn("COUNT", col("vouchers.id")), "voucher_count"]],
    },
    include: [{ model: VoucherModel, as: "vouchers", attributes: [] }],
    group: [col("campaign.id")],
    subQuery: false,
  });

  return row ? toCampaign(row) : null;
}

export async function createCampaignRecord(data: CampaignRecord): Promise<number> {
  const row = await CampaignModel.create(data);
  return row.id;
}

export async function deleteCampaignById(id: number): Promise<boolean> {
  const deleted = await CampaignModel.destroy({ where: { id } });
  return deleted > 0;
}
