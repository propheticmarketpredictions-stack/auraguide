import React from "react";
import { Button } from "@/components/ui/button";
import { Radio, Play, Tv, LayoutGrid, Sparkles } from "lucide-react";

const countOptions = [10, 15, 25];
const mediaTypes = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "live", label: "Live TV", icon: Radio },
  { value: "streaming", label: "Streaming", icon: Play },
  { value: "on-demand", label: "On Demand", icon: Tv },
];

export default function FilterBar({ count, setCount, mediaType, setMediaType, onRefresh, isLoading }) {
  return (
    <div className="space-y-4">
      {/* Count selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-body uppercase tracking-wider mr-1">Top</span>
        {countOptions.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={count === c ? "default" : "ghost"}
            onClick={() => setCount(c)}
            className={`h-8 px-3 text-xs font-heading font-semibold rounded-lg ${
              count === c
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {c}
          </Button>
        ))}
      </div>

      {/* Media type filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {mediaTypes.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            size="sm"
            variant={mediaType === value ? "default" : "ghost"}
            onClick={() => setMediaType(value)}
            className={`h-8 px-3 text-xs font-body rounded-lg gap-1.5 ${
              mediaType === value
                ? "bg-secondary text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </Button>
        ))}

        <div className="flex-1" />

        <Button
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 px-4 text-xs font-heading font-semibold bg-gradient-to-r from-primary to-accent text-white rounded-lg gap-1.5 hover:opacity-90"
        >
          <Sparkles className="w-3 h-3" />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}