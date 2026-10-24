"use client";

import { use } from "react";
import { GeneralInfoTab } from "./tabs/general";

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const resolvedParams = use(params);

  return (
    <GeneralInfoTab clientId={resolvedParams.id} />
  );
}
