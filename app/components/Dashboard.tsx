"use client";

import { useCallback, useEffect, useState } from "react";
import { useCampaigns } from "@/app/hooks/useCampaigns";
import { useToast } from "@/app/hooks/useToast";
import { useVouchers } from "@/app/hooks/useVouchers";
import type { Campaign } from "@/lib/types";
import { CheckCircle, AlertCircle } from "@deemlol/next-icons";
import VouchersModal from "./VouchersModal";
import CampaignsSection, { type CampaignFormState } from "./CampaignsSection";

type DashboardProps = {
  initialCampaigns: Campaign[];
  loadError?: string | null;
};

export default function Dashboard({
  initialCampaigns,
  loadError = null,
}: DashboardProps) {
  const { message, messageType, showToast, clearToast } = useToast();
  const onError = useCallback(
    (text: string) => showToast(text, "error"),
    [showToast],
  );

  const {
    campaigns,
    selectedId,
    setSelectedId,
    loading: campaignsLoading,
    refresh: refreshCampaigns,
    createCampaign,
    deleteCampaign,
  } = useCampaigns({ initialCampaigns, onError });

  const {
    vouchers,
    total: voucherTotal,
    loading: vouchersLoading,
    batchCount,
    setBatchCount,
    refresh: refreshVouchers,
    generateBatch,
  } = useVouchers(selectedId, { onError });

  const [vouchersModalOpen, setVouchersModalOpen] = useState(false);
  const [form, setForm] = useState<CampaignFormState>({
    prefix: "DISCOUNT",
    amount: "10",
    currency: "EUR",
    valid_from: new Date().toISOString().slice(0, 10),
    valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  });

  useEffect(() => {
    if (loadError) showToast(loadError, "error");
  }, [loadError, showToast]);

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    clearToast();
    try {
      const campaign = await createCampaign({
        prefix: form.prefix,
        amount: Number(form.amount),
        currency: form.currency,
        valid_from: form.valid_from,
        valid_to: form.valid_to,
      });
      showToast(`Campaign "${campaign.prefix}" created successfully.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Create failed", "error");
    }
  }

  async function handleBatchVouchers() {
    clearToast();
    try {
      const data = await generateBatch(Number(batchCount));
      if (!data) return;

      await refreshCampaigns();
      await refreshVouchers();

      if (data.complete === false || data.created !== data.requested) {
        showToast(
          `Created ${data.created.toLocaleString()} of ${data.requested.toLocaleString()} requested voucher(s).`,
          "error",
        );
      } else {
        showToast(`Generated ${data.created.toLocaleString()} voucher(s).`);
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Batch create failed",
        "error",
      );
    }
  }

  async function handleDeleteCampaign() {
    if (selectedId == null) return;
    if (!confirm("Delete this campaign and all its vouchers?")) return;

    clearToast();
    try {
      await deleteCampaign(selectedId);
      showToast("Campaign deleted.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }

  const selected = campaigns.find((c) => c.id === selectedId);
  const loading = campaignsLoading || vouchersLoading;

  return (
    <>
      {message && (
        <div
          role="status"
          className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-red-200/80 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          <span className="mt-0.5 shrink-0 text-base">
            {messageType === "success" ? <CheckCircle /> : <AlertCircle />}
          </span>
          <p>{message}</p>
        </div>
      )}

      <CampaignsSection
        campaigns={campaigns}
        selectedId={selectedId}
        loading={loading}
        form={form}
        setForm={setForm}
        onCreateCampaign={handleCreateCampaign}
        onCampaignSelect={(id) => {
          setSelectedId(id);
          setVouchersModalOpen(true);
        }}
      />

      {selected && (
        <VouchersModal
          open={vouchersModalOpen}
          onClose={() => setVouchersModalOpen(false)}
          campaign={selected}
          vouchers={vouchers}
          voucherTotal={voucherTotal}
          batchCount={batchCount}
          setBatchCount={setBatchCount}
          loading={loading}
          onGenerate={handleBatchVouchers}
          onDeleteCampaign={handleDeleteCampaign}
        />
      )}
    </>
  );
}
