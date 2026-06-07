import { NextResponse } from "next/server";
import { findAllCampaigns } from "@/lib/repositories/campaigns";
import { createCampaign } from "@/lib/services/campaigns";
import { validateCreateCampaignInput } from "@/lib/validators/campaigns";

export async function GET() {
  try {
    const campaigns = await findAllCampaigns();
    return NextResponse.json(campaigns);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to list campaigns" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateCreateCampaignInput(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const campaign = await createCampaign(validation.data);
    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 },
    );
  }
}
