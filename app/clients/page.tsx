"use client";

import * as React from "react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTabs, PageTabContent } from "@/components/commonComponents/PageTabs";
import type { TabConfig } from "@/components/commonComponents/PageTabs";
import { ClientsTab } from "./tabs/clients/index";

export default function Clients() {
  const [clientsCount, setClientsCount] = React.useState<number | undefined>(undefined);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "clients";

  const handleTabChange = React.useCallback((value: string) => {
    router.push(`/clients?tab=${value}`);
  }, [router]);

  const tabs: TabConfig[] = [
    { value: "clients", icon: HiOutlineUserGroup, label: "Clients", badge: clientsCount },
  ];

  return (
    <div className="space-y-6">
      <PageTabs tabs={tabs} currentTab={currentTab} onTabChange={handleTabChange}>
        <PageTabContent value="clients">
          <ClientsTab onClientsCountChange={setClientsCount} />
        </PageTabContent>
      </PageTabs>
    </div>
  );
}
