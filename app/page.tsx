import { findAllCampaigns } from "@/lib/repositories/campaigns";
import type { Campaign } from "@/lib/types";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";

export default async function Home() {
  let initialCampaigns: Campaign[] = [];
  let loadError: string | null = null;

  try {
    initialCampaigns = await findAllCampaigns();
  } catch {
    loadError = "Failed to load campaigns";
  }

  return (
    <div className="app-gradient min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Header />
        <Dashboard
          initialCampaigns={initialCampaigns}
          loadError={loadError}
        />
      </div>
    </div>
  );
}
