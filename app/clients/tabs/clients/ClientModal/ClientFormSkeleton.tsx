import { Skeleton } from "@/components/ui/skeleton";

// Individual field skeleton matching the form structure
const FieldSkeleton = () => (
  <div className="grid gap-2">
    <Skeleton className="h-4 w-24" /> {/* Label */}
    <Skeleton className="h-10 w-full" /> {/* Input */}
  </div>
);

// Textarea field skeleton (for Notes field)
const TextareaSkeleton = () => (
  <div className="grid gap-2">
    <Skeleton className="h-4 w-16" /> {/* Label */}
    <Skeleton className="h-20 w-full" /> {/* Textarea */}
  </div>
);

export function ClientFormSkeleton() {
  return (
    <div className="space-y-8">
      {/* Section 1: Client Information */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" /> {/* Section heading */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Client */}
          <FieldSkeleton />

          {/* Client Short Name */}
          <FieldSkeleton />

          {/* Client Type */}
          <FieldSkeleton />

          {/* Status */}
          <FieldSkeleton />

          {/* Notes (textarea) */}
          <TextareaSkeleton />
        </div>
      </div>

      {/* Section 2: Client Location */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-28" /> {/* Section heading */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* State */}
          <FieldSkeleton />

          {/* City */}
          <FieldSkeleton />

          {/* County */}
          <FieldSkeleton />

          {/* Zip */}
          <FieldSkeleton />

          {/* Address */}
          <FieldSkeleton />
        </div>
      </div>

      {/* Section 3: Client Management */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-36" /> {/* Section heading */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Client Manager */}
          <FieldSkeleton />

          {/* Sales Manager */}
          <FieldSkeleton />
        </div>
      </div>
      
      {/* Section 4: Client Management */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-36" /> {/* Section heading */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Client Manager */}
          <FieldSkeleton />

          {/* Sales Manager */}
          <FieldSkeleton />
        </div>
      </div>
    </div>
  );
}
