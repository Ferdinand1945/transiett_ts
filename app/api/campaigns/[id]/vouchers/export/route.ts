import { findCampaignById } from "@/lib/repositories/campaigns";
import { streamVoucherCodesByCampaignId } from "@/lib/repositories/vouchers";
import { parseCampaignId } from "@/lib/validators/campaigns";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = parseCampaignId(id);
    if (!parsed.success) {
      return new Response(parsed.error, { status: 400 });
    }

    const campaign = await findCampaignById(parsed.data);
    if (!campaign) {
      return new Response("Campaign not found", { status: 404 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode("code\n"));
        for await (const codes of streamVoucherCodesByCampaignId(parsed.data)) {
          for (const code of codes) {
            controller.enqueue(encoder.encode(`${code}\n`));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="vouchers-${campaign.prefix}-${parsed.data}.csv"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Failed to export vouchers", { status: 500 });
  }
}
