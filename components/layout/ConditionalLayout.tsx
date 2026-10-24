"use client";

import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/commonComponents/AppSidebar";
import { ThemeCustomizer } from "@/components/commonComponents/ThemeCustomizer";
import { SidebarManager } from "@/components/commonComponents/SidebarManager";
import { ProfileAvatar } from "@/components/commonComponents/ProfileAvatar";
import { ClientWorkspaceSelector } from "@/components/commonComponents/ClientWorkspaceSelector";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/commonComponents/Loader";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login"];
const NO_SIDEBAR_ROUTES: string[] = [];

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  // Route protection is now handled by middleware.ts

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isNoSidebarRoute = NO_SIDEBAR_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (isPublicRoute || isNoSidebarRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <SidebarManager />
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex min-w-0 flex-1 items-center justify-between">
            <div className="flex items-center gap-2"></div>
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              <ClientWorkspaceSelector />
              <div className="h-8 w-px shrink-0 bg-border/90" />
              <div className="shrink-0">
                <ProfileAvatar />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 2xl:p-4 main-bg">{children}</main>
      </SidebarInset>
      <ThemeCustomizer />
    </SidebarProvider>
  );
}
