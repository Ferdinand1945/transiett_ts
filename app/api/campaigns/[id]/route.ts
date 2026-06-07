import { NextResponse } from "next/server";
import { deleteCampaignById } from "@/lib/repositories/campaigns";
import { parseCampaignId } from "@/lib/validators/campaigns";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = parseCampaignId(id);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const deleted = await deleteCampaignById(parsed.data);
    if (!deleted) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 },
    );
  }
}
