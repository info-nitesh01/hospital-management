"use client";

import * as React from "react";
import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTabs, PageTabContent } from "@/components/commonComponents/PageTabs";
import type { TabConfig } from "@/components/commonComponents/PageTabs";
import {
  HiOutlineInformationCircle,
  HiOutlineBanknotes,
  HiOutlineHome,
} from "react-icons/hi2";
import { GeneralInfoTab } from "./tabs/general";
import { AccountTab } from "./tabs/account";
import { PropertyTab } from "./tabs/property";

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current tab from URL or use default
  const currentTab = searchParams.get("tab") || "general";

  // Handle tab change and update URL
  const handleTabChange = React.useCallback((value: string) => {
    router.push(`/clients/${resolvedParams.id}?tab=${value}`);
  }, [router, resolvedParams.id]);

  // Define tabs configuration
  const tabs: TabConfig[] = [
    {
      value: "general",
      icon: HiOutlineInformationCircle,
      label: "General Information",
    },
    {
      value: "account",
      icon: HiOutlineBanknotes,
      label: "Account",
    },
    {
      value: "property",
      icon: HiOutlineHome,
      label: "Property",
    },
  ];

  return (
    <div className="space-y-4">
      <PageTabs tabs={tabs} currentTab={currentTab} onTabChange={handleTabChange}>
        <PageTabContent value="general">
          <GeneralInfoTab clientId={resolvedParams.id} />
        </PageTabContent>

        <PageTabContent value="account">
          <AccountTab />
        </PageTabContent>

        <PageTabContent value="property">
          <PropertyTab />
        </PageTabContent>
      </PageTabs>
    </div>
  );
}
