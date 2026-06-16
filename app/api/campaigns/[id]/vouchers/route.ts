import { NextResponse } from "next/server";
import { findVouchersByCampaignId } from "@/lib/repositories/vouchers";
import { createVouchersBatch } from "@/lib/services/campaigns";
import { parseCampaignId } from "@/lib/validators/campaigns";
import {
  validateBatchVoucherCount,
  validateVoucherListQuery,
} from "@/lib/validators/vouchers";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = parseCampaignId(id);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const query = validateVoucherListQuery(searchParams);
    if (!query.success) {
      return NextResponse.json({ error: query.error }, { status: 400 });
    }

    const result = await findVouchersByCampaignId(
      parsed.data,
      query.data.limit,
      query.data.offset,
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to list vouchers" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = parseCampaignId(id);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const body = await request.json();
    const validation = validateBatchVoucherCount(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await createVouchersBatch(parsed.data, validation.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);

    const message =
      err instanceof Error ? err.message : "Failed to create vouchers";
    const status = message === "Campaign not found" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
