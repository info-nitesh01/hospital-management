"use client";

import * as React from "react";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronUp,
  HiOutlineUser,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/api";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { IconType } from "react-icons";
import { DashboardIcon, UsersIcon } from "@/styles/custom-icons/SidebarIcons";

interface SubMenuItem {
  title: string;
  url: string;
}

interface NavigationItem {
  title: string;
  url: string;
  icon: IconType;
  isActive?: boolean;
  subItems?: SubMenuItem[];
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const navigationItems: NavigationGroup[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: DashboardIcon,
        isActive: true,
      },
      {
        title: "Clients",
        url: "/clients",
        icon: UsersIcon,
      },
      {
        title: "Users",
        url: "/users",
        icon: HiOutlineUserGroup,
      },
    ],
  },
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const { userId, userRoles } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const visibleNavigationItems = navigationItems.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.title !== "Users" || userRoles.includes("Admin")),
  }));

  const getInitialOpenSubmenu = () => {
    for (const group of visibleNavigationItems) {
      for (const item of group.items) {
        if (item.subItems) {
          const hasActiveSubItem = item.subItems.some(
            (subItem) => subItem.url === pathname
          );
          if (hasActiveSubItem) {
            return item.title;
          }
        }
      }
    }
    return null;
  };

  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(
    getInitialOpenSubmenu()
  );

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.url === pathname) return true;
    // Check if current path starts with item URL (for nested routes like /clients/{id})
    if (item.url !== "/" && pathname.startsWith(item.url)) return true;
    if ("subItems" in item && item.subItems) {
      return item.subItems.some(
        (subItem: SubMenuItem) => subItem.url === pathname
      );
    }
    return false;
  };

  const toggleSubmenu = (title: string): void => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  return (
    <Sidebar collapsible="icon" className={className}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent hover:text-inherit cursor-pointer"
            >
              <Link href="/">
                <Image src="/logo.png" alt="logo" width={45} height={45} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Docu</span>
                  <span className="truncate text-xs text-muted-foreground">
                    v1.0.0
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {visibleNavigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <React.Fragment key={item.title}>
                    <SidebarMenuItem>
                      {item.subItems ? (
                        <>
                          <SidebarMenuButton
                            onClick={() => toggleSubmenu(item.title)}
                            isActive={isItemActive(item)}
                            className="w-full"
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                            <HiOutlineChevronUp
                              className={`ml-auto h-4 w-4 transition-transform duration-300 ${
                                openSubmenu === item.title ? "" : "rotate-180"
                              }`}
                            />
                          </SidebarMenuButton>
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              openSubmenu === item.title
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <SidebarMenuSub
                                className={`transition-all duration-300 ${
                                  openSubmenu === item.title
                                    ? "translate-y-0"
                                    : "-translate-y-2"
                                }`}
                              >
                                {item.subItems.map((subItem, index) => (
                                  <SidebarMenuSubItem
                                    key={subItem.title}
                                    className={`transition-all duration-300 ${
                                      openSubmenu === item.title
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 -translate-x-2"
                                    }`}
                                    style={{
                                      transitionDelay:
                                        openSubmenu === item.title
                                          ? `${index * 50}ms`
                                          : "0ms",
                                    }}
                                  >
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === subItem.url}
                                    >
                                      <Link href={subItem.url}>
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </div>
                          </div>
                        </>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={isItemActive(item)}
                          tooltip={item.title}
                        >
                          <Link href={item.url}>
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  </React.Fragment>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="ml-0.5">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-transparent hover:bg-transparent hover:text-inherit active:bg-transparent active:text-inherit"
                >
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="rounded-lg">
                      {userId ? userId.substring(0, 2).toUpperCase() : "JD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userId ? `User ${userId.substring(0, 8)}` : "John Doe"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userId
                        ? `ID: ${userId.substring(0, 8)}...`
                        : "john.doe@example.com"}
                    </span>
                  </div>
                  <HiOutlineChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="/avatar.png" alt="User" />
                      <AvatarFallback className="rounded-lg">
                        {userId ? userId.substring(0, 2).toUpperCase() : "JD"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userId ? `User ${userId.substring(0, 8)}` : "John Doe"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {userId
                          ? `ID: ${userId.substring(0, 8)}...`
                          : "john.doe@example.com"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HiOutlineUser className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  <HiOutlineArrowRightOnRectangle className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
