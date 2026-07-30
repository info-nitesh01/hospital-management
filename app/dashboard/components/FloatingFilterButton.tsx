"use client";

import { HiOutlineFunnel } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FloatingFilterButtonProps {
  onClick: () => void;
  filterCount: number;
}

export function FloatingFilterButton({
  onClick,
  filterCount,
}: FloatingFilterButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-3 right-3 z-20 rounded-full shadow-lg hover:shadow-xl transition-shadow",
        "h-12 w-12 p-0"
      )}
      aria-label="Open filters"
    >
      <div className="relative">
        <HiOutlineFunnel className="size-5" />
        {filterCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 size-5 p-0 flex items-center justify-center text-xs"
          >
            {filterCount}
          </Badge>
        )}
      </div>
    </Button>
  );
}
