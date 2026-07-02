import React from "react";
import { Radio } from "lucide-react";

const SERVICES = [
  { id: "netflix", label: "Netflix", color: "text-red-500", bg: "bg-red-500/10 border-red-500/40", emoji: "🎬" },
  { id: "hulu", label: "Hulu", color: "text-green-400", bg: "bg-green-400/10 border-green-400/40", emoji: "📺" },
  { id: "max", label: "Max", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/40", emoji: "🎭" },
  { id: "amazon", label: "Prime Video", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/40", emoji: "📦" },
  { id: "appletv", label: "Apple TV+", color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/40", emoji: "🍎" },
  { id: "peacock", label: "Peacock", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/40", emoji: "🦚" },
  { id: "paramount", label: "Paramount+", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/40", emoji: "⭐" },
  { id: "disney", label: "Disney+", color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/40", emoji: "✨" },
  { id: "pluto", label: "Pluto TV", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/40", emoji: "🪐" },
  { id: "livetv", label: "Live TV", color: "text-red-400", bg: "bg-red-400/10 border-red-400/40", emoji: "📡" },
];

export { SERVICES };

export default function ServiceTabs({ activeService, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {SERVICES.map((s) => {
        const isActive = activeService === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-heading font-semibold transition-all ${
              isActive
                ? `${s.bg} ${s.color} shadow-md`
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 bg-secondary/30"
            }`}
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}