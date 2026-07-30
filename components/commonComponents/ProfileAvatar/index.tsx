"use client";

import * as React from "react";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export function ProfileAvatar() {
  const { userName, userEmail, logout } = useAuth();

  // Get user initials for avatar fallback
  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="h-9 w-9 cursor-pointer rounded-lg">
            <AvatarImage src="/avatar.png" alt={userName || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium rounded-lg">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end" sideOffset={8}>
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src="/avatar.png" alt={userName || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-base font-medium rounded-lg">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail || "user@example.com"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Menu Items */}
          <div className="space-y-1">
            <Button
              variant="destructive"
              className="w-full justify-start gap-2 text-sm font-normal"
              onClick={handleLogout}
            >
              <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
