"use client";

import { useCallback, useEffect, useState } from "react";
import * as campaignsApi from "@/lib/api/campaigns";
import type { Campaign, CreateCampaignInput } from "@/lib/types";

type UseCampaignsOptions = {
  onError?: (message: string) => void;
};

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const { onError } = options;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const data = await campaignsApi.fetchCampaigns();
    setCampaigns(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await campaignsApi.fetchCampaigns();
        if (!cancelled) setCampaigns(data);
      } catch (e) {
        if (!cancelled) {
          onError?.(e instanceof Error ? e.message : "Load failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onError]);

  const createCampaign = useCallback(
    async (input: CreateCampaignInput) => {
      setLoading(true);
      try {
        const campaign = await campaignsApi.createCampaign(input);
        await refresh();
        setSelectedId(campaign.id);
        return campaign;
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const deleteCampaign = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        await campaignsApi.deleteCampaign(id);
        setSelectedId(null);
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  return {
    campaigns,
    selectedId,
    setSelectedId,
    loading,
    refresh,
    createCampaign,
    deleteCampaign,
  };
}
