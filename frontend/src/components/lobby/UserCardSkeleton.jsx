"use client";

// Placeholder shown while the online list is loading.
export function UserCardSkeleton() {
  return (
    <div className="glass p-5 h-full flex flex-col items-center text-center animate-pulse">
      <div className="w-16 h-16 rounded-2xl bg-white/8 mb-4" />
      <div className="h-4 w-24 rounded bg-white/8 mb-2" />
      <div className="h-3 w-16 rounded bg-white/6 mb-3" />
      <div className="flex gap-1.5 mb-5">
        <div className="h-4 w-10 rounded-full bg-white/6" />
        <div className="h-4 w-10 rounded-full bg-white/6" />
      </div>
      <div className="h-9 w-full rounded-xl bg-white/8 mt-auto" />
    </div>
  );
}
