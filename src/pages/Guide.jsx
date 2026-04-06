import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Tv, AlertCircle } from "lucide-react";

import OnboardingModal from "../components/guide/OnboardingModal";
import Header from "../components/guide/Header";
import FilterBar from "../components/guide/FilterBar";
import ChannelCard from "../components/guide/ChannelCard";
import LoadingSkeleton from "../components/guide/LoadingSkeleton";

const STORAGE_KEY = "channel_guide_profile";

function getStoredProfile() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

function buildPrompt(profile, count, mediaType) {
  const now = new Date();
  const currentTime = format(now, "h:mm a");
  const currentDay = format(now, "EEEE, MMMM d, yyyy");
  const dayOfWeek = format(now, "EEEE");

  let prompt = `You are an expert TV and media guide assistant. It is currently ${currentTime} on ${currentDay} (${dayOfWeek}).

Generate a list of exactly ${count} channel/media recommendations that are currently airing live or readily available to watch right now.`;

  if (mediaType === "live") {
    prompt += `\n\nFocus ONLY on live TV channels and what is currently broadcasting live right now.`;
  } else if (mediaType === "streaming") {
    prompt += `\n\nFocus ONLY on popular streaming platforms (Netflix, Hulu, Disney+, HBO Max, Amazon Prime, Apple TV+, Peacock, Paramount+, etc.) and their top currently available content.`;
  } else if (mediaType === "on-demand") {
    prompt += `\n\nFocus ONLY on on-demand content available through cable/satellite on-demand, free streaming services (Tubi, Pluto TV, Roku Channel), and rental platforms.`;
  } else {
    prompt += `\n\nInclude a mix of live TV channels, streaming platform content, and on-demand options.`;
  }

  if (profile?.name) {
    prompt += `\n\nThe viewer's name is ${profile.name}.`;
  }

  if (profile?.birthday) {
    const birthDate = new Date(profile.birthday);
    const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    prompt += ` They are ${age} years old, so tailor content recommendations to be appropriate and appealing for their age group.`;
  }

  if (profile?.location) {
    prompt += ` They are located in ${profile.location}, so include local channels and regional content available in that area.`;
  }

  prompt += `\n\nFor each recommendation include:
- rank (1 to ${count})
- channel_name: the channel or platform name
- current_show: what's currently playing or the recommended title
- type: "live", "streaming", or "on-demand"
- genre: one of "News", "Sports", "Movies", "Comedy", "Drama", "Kids", "Documentary", "Music", "Reality", "Sci-Fi"
- description: brief 1-sentence description of why they should watch this now
- rating: a quality rating out of 10 (e.g. "8.5/10")

Make the recommendations feel current, timely, and personalized. Consider what typically airs at this time of day and day of the week. Include popular, trending, and hidden gem picks.`;

  return prompt;
}

export default function Guide() {
  const [profile, setProfile] = useState(getStoredProfile());
  const [showOnboarding, setShowOnboarding] = useState(!profile);
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(25);
  const [mediaType, setMediaType] = useState("all");

  const fetchRecommendations = useCallback(async (overrideCount, overrideType) => {
    setIsLoading(true);
    setError(null);

    const useCount = overrideCount || count;
    const useType = overrideType || mediaType;

    const prompt = buildPrompt(profile, useCount, useType);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          channels: {
            type: "array",
            items: {
              type: "object",
              properties: {
                rank: { type: "number" },
                channel_name: { type: "string" },
                current_show: { type: "string" },
                type: { type: "string" },
                genre: { type: "string" },
                description: { type: "string" },
                rating: { type: "string" },
              },
            },
          },
        },
      },
    });

    setChannels(result.channels || []);
    setIsLoading(false);
  }, [profile, count, mediaType]);

  useEffect(() => {
    if (profile && channels.length === 0) {
      fetchRecommendations();
    }
  }, [profile]);

  const handleOnboardingComplete = (newProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
    setShowOnboarding(false);
  };

  const handleEditProfile = () => {
    setShowOnboarding(true);
  };

  const handleCountChange = (newCount) => {
    setCount(newCount);
    fetchRecommendations(newCount, mediaType);
  };

  const handleMediaTypeChange = (newType) => {
    setMediaType(newType);
    fetchRecommendations(count, newType);
  };

  const filteredChannels = channels;

  return (
    <div className="min-h-screen bg-background font-body">
      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <Header profile={profile} onEditProfile={handleEditProfile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              {profile?.name ? `${profile.name}'s Picks` : "What's On Now"}
            </h2>
            <p className="text-muted-foreground font-body text-sm mt-2 max-w-xl">
              AI-curated recommendations based on what's live and trending right now.
              {profile?.location && ` Tuned for ${profile.location}.`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          count={count}
          setCount={handleCountChange}
          mediaType={mediaType}
          setMediaType={handleMediaTypeChange}
          onRefresh={() => fetchRecommendations()}
          isLoading={isLoading}
        />

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-body">{error}</p>
          </div>
        )}

        {/* Channel grid */}
        {isLoading ? (
          <LoadingSkeleton count={count} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredChannels.map((channel, i) => (
              <ChannelCard key={`${channel.rank}-${channel.channel_name}`} channel={channel} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredChannels.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Tv className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-foreground">No channels loaded</h3>
            <p className="text-muted-foreground text-sm mt-1">Click Refresh to get your personalized recommendations</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-xs text-muted-foreground font-body">
            Powered by AI · Recommendations update in real-time · {format(new Date(), "h:mm a")}
          </p>
        </footer>
      </main>
    </div>
  );
}