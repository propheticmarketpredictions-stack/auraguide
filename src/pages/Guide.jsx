import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfDay } from "date-fns";
import { Tv, AlertCircle, CalendarDays, Loader2 } from "lucide-react";

import OnboardingModal from "../components/guide/OnboardingModal";
import Header from "../components/guide/Header";
import FilterBar from "../components/guide/FilterBar";
import ChannelCard from "../components/guide/ChannelCard";
import LoadingSkeleton from "../components/guide/LoadingSkeleton";
import SchedulePicker from "../components/guide/SchedulePicker";
import DonationBanner from "../components/guide/DonationBanner";

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

  prompt += `\n\nFor each entry provide: rank (1-${count}), channel_name, current_show, type ("live"/"streaming"/"on-demand"), genre (News/Sports/Movies/Comedy/Drama/Kids/Documentary/Music/Reality/Sci-Fi), description (one short sentence), rating (e.g. "8.5/10"). Keep descriptions under 15 words.`;

  return prompt;
}

export default function Guide() {
  const [profile, setProfile] = useState(getStoredProfile());
  const [showOnboarding, setShowOnboarding] = useState(!profile);
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(10);
  const [mediaType, setMediaType] = useState("all");
  const [scheduleDate, setScheduleDate] = useState(startOfDay(new Date()));
  const [scheduleHour, setScheduleHour] = useState(new Date().getHours());
  const [scheduleChannels, setScheduleChannels] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

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
              required: ["rank", "channel_name", "current_show", "type", "genre"],
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

  const fetchSchedule = useCallback(async (date, hour) => {
    setScheduleLoading(true);
    const useDate = date || scheduleDate;
    const useHour = hour !== undefined ? hour : scheduleHour;
    const h = useHour % 12 || 12;
    const ampm = useHour < 12 ? "AM" : "PM";
    const timeLabel = `${h}:00 ${ampm}`;
    const dateLabel = format(useDate, "EEEE, MMMM d, yyyy");

    const prompt = `You are an expert TV and media guide. Generate the top 25 channel/content picks for ${timeLabel} on ${dateLabel}.
Include live TV, streaming, and on-demand options. For each entry: rank (1-25), channel_name, current_show, type ("live"/"streaming"/"on-demand"), genre (News/Sports/Movies/Comedy/Drama/Kids/Documentary/Music/Reality/Sci-Fi), description (max 12 words), rating (e.g. "8/10"). Keep it concise.`;

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
              required: ["rank", "channel_name", "current_show", "type", "genre"],
            },
          },
        },
      },
    });
    setScheduleChannels(result.channels || []);
    setScheduleLoading(false);
  }, [scheduleDate, scheduleHour]);

  const handleScheduleDateChange = (date) => {
    setScheduleDate(date);
    setScheduleChannels([]);
  };

  const handleScheduleHourChange = (hour) => {
    setScheduleHour(hour);
    fetchSchedule(scheduleDate, hour);
  };

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

        {/* Schedule Section */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <CalendarDays className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-heading font-semibold text-foreground">Future Schedule</span>
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>

          <SchedulePicker
            selectedDate={scheduleDate}
            selectedHour={scheduleHour}
            onDateChange={handleScheduleDateChange}
            onHourChange={handleScheduleHourChange}
          />

          {scheduleLoading && (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-body">Loading schedule for {format(scheduleDate, "MMM d")} at {scheduleHour % 12 || 12}{scheduleHour < 12 ? "am" : "pm"}...</span>
            </div>
          )}

          {!scheduleLoading && scheduleChannels.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-body">
                Top 25 picks for <span className="text-foreground font-medium">{format(scheduleDate, "EEEE, MMM d")}</span> at <span className="text-foreground font-medium">{scheduleHour % 12 || 12}:00 {scheduleHour < 12 ? "AM" : "PM"}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {scheduleChannels.map((channel, i) => (
                  <ChannelCard key={`sched-${channel.rank}-${channel.channel_name}`} channel={channel} index={i} />
                ))}
              </div>
            </div>
          )}

          {!scheduleLoading && scheduleChannels.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm font-body">
              Select a time slot above to load schedule picks.
            </div>
          )}
        </div>

        {/* Donation */}
        <DonationBanner />

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