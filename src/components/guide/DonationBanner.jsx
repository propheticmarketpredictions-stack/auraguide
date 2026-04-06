import React, { useState } from "react";
import { Heart, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const BITCOIN_ADDRESS = "3GEfYcSTHFh29NUEPmJAjVbnvaqLgGfyhz";

export default function DonationBanner() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyBitcoin = () => {
    navigator.clipboard.writeText(BITCOIN_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-red-400 fill-red-400/30" />
          <span className="text-sm font-heading font-semibold text-foreground">Support This Project</span>
          <span className="text-xs text-muted-foreground font-body hidden sm:inline">
            — help with the cost of running this site & other web endeavors
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded donation options */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground font-body">
            If anyone wants to help with the price of owning a website &amp; my other website endeavors, any amount is appreciated! 🙏
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* PayPal */}
            <a
              href="https://paypal.me/vineassembly5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/40 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-heading font-bold text-sm">PP</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-heading font-semibold text-foreground group-hover:text-blue-400 transition-colors">PayPal</p>
                <p className="text-[11px] text-muted-foreground truncate">vineassembly5@gmail.com</p>
              </div>
            </a>

            {/* CashApp */}
            <a
              href="https://cash.app/$icjavelin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/40 hover:border-green-500/50 hover:bg-green-500/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-green-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-heading font-bold text-sm">$</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-heading font-semibold text-foreground group-hover:text-green-400 transition-colors">Cash App</p>
                <p className="text-[11px] text-muted-foreground truncate">$icjavelin</p>
              </div>
            </a>

            {/* Bitcoin */}
            <button
              onClick={copyBitcoin}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/40 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-heading font-bold text-sm">₿</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-heading font-semibold text-foreground group-hover:text-orange-400 transition-colors">Bitcoin (BTC)</p>
                <p className="text-[11px] text-muted-foreground truncate font-mono">{BITCOIN_ADDRESS.slice(0, 16)}…</p>
              </div>
              <div className="flex-shrink-0">
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-orange-400" />
                )}
              </div>
            </button>
          </div>

          {/* Full BTC address */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 border border-border">
            <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider flex-shrink-0">BTC Address:</span>
            <span className="text-[11px] text-foreground font-mono truncate flex-1">{BITCOIN_ADDRESS}</span>
            <button onClick={copyBitcoin} className="flex-shrink-0 text-muted-foreground hover:text-orange-400 transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}