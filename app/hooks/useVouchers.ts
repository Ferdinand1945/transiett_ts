"use client";

import { useCallback, useEffect, useState } from "react";
import * as campaignsApi from "@/lib/api/campaigns";
import type { CreateVouchersBatchResult, Voucher } from "@/lib/types";

type UseVouchersOptions = {
  onError?: (message: string) => void;
};

export function useVouchers(
  campaignId: number | null,
  options: UseVouchersOptions = {},
) {
  const { onError } = options;
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [batchCount, setBatchCount] = useState("100");

  const refresh = useCallback(async () => {
    if (campaignId == null) return;
    const data = await campaignsApi.fetchVouchers(campaignId);
    setVouchers(data.vouchers);
    setTotal(data.total);
    return data;
  }, [campaignId]);

  useEffect(() => {
    if (campaignId == null) {
      setVouchers([]);
      setTotal(0);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await campaignsApi.fetchVouchers(campaignId);
        if (!cancelled) {
          setVouchers(data.vouchers);
          setTotal(data.total);
        }
      } catch (e) {
        if (!cancelled) {
          onError?.(e instanceof Error ? e.message : "Load failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaignId, onError]);

  const generateBatch = useCallback(
    async (count: number): Promise<CreateVouchersBatchResult | null> => {
      if (campaignId == null) return null;
      setLoading(true);
      try {
        return await campaignsApi.createVouchersBatch(campaignId, count);
      } finally {
        setLoading(false);
      }
    },
    [campaignId],
  );

  return {
    vouchers,
    total,
    loading,
    batchCount,
    setBatchCount,
    refresh,
    generateBatch,
  };
}
