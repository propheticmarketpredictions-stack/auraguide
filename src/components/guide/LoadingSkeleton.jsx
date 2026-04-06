import React from "react";

export default function LoadingSkeleton({ count = 25 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: Math.min(count, 20) }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card overflow-hidden animate-pulse"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="h-2 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 bg-[length:200%_100%] animate-shimmer" />
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-secondary rounded w-3/4" />
                <div className="h-2 bg-secondary/60 rounded w-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 bg-secondary rounded-full w-14" />
              <div className="h-5 bg-secondary rounded-full w-16" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-secondary/40 rounded w-full" />
              <div className="h-2 bg-secondary/40 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}