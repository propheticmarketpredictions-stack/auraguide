import React from "react";
import { Tv, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Header({ profile, onEditProfile }) {
  const now = new Date();
  const timeStr = format(now, "h:mm a");
  const dateStr = format(now, "EEEE, MMMM d");

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground tracking-tight">
                Murmur
              </h1>
              <p className="text-[11px] text-muted-foreground font-body">
                {dateStr} · {timeStr}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {profile?.name && (
              <span className="text-sm text-muted-foreground font-body hidden sm:block">
                Hi, <span className="text-foreground font-medium">{profile.name}</span>
              </span>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={onEditProfile}
              className="w-9 h-9 text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}