import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Radio, Play, Tv } from "lucide-react";
import { motion } from "framer-motion";

const typeColors = {
  live: "bg-red-500/20 text-red-400 border-red-500/30",
  streaming: "bg-accent/20 text-accent border-accent/30",
  "on-demand": "bg-primary/20 text-primary border-primary/30",
};

const typeIcons = {
  live: Radio,
  streaming: Play,
  "on-demand": Tv,
};

const genreColors = {
  "News": "from-blue-600/30 to-blue-900/30",
  "Sports": "from-green-600/30 to-green-900/30",
  "Movies": "from-purple-600/30 to-purple-900/30",
  "Comedy": "from-yellow-600/30 to-yellow-900/30",
  "Drama": "from-red-600/30 to-red-900/30",
  "Kids": "from-pink-600/30 to-pink-900/30",
  "Documentary": "from-teal-600/30 to-teal-900/30",
  "Music": "from-indigo-600/30 to-indigo-900/30",
  "Reality": "from-orange-600/30 to-orange-900/30",
  "Sci-Fi": "from-cyan-600/30 to-cyan-900/30",
};

export default function ChannelCard({ channel, index }) {
  const TypeIcon = typeIcons[channel.type] || Tv;
  const gradientClass = genreColors[channel.genre] || "from-secondary to-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-40 group-hover:opacity-60 transition-opacity`} />

      {/* Rank badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border">
          <span className="text-xs font-heading font-bold text-foreground">
            {channel.rank}
          </span>
        </div>
      </div>

      {/* Live indicator */}
      {channel.type === "live" && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-red-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-glow" />
          Live
        </div>
      )}

      <div className="relative p-4 pt-14">
        {/* Channel info */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {channel.channel_name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 font-body">
            {channel.current_show}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${typeColors[channel.type] || ""}`}>
            <TypeIcon className="w-2.5 h-2.5 mr-1" />
            {channel.type}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
            {channel.genre}
          </Badge>
        </div>

        {/* Description */}
        {channel.description && (
          <p className="text-[11px] text-muted-foreground mt-3 line-clamp-2 font-body leading-relaxed">
            {channel.description}
          </p>
        )}

        {/* Rating */}
        {channel.rating && (
          <div className="flex items-center gap-1 mt-3">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[11px] text-muted-foreground font-body">{channel.rating}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}