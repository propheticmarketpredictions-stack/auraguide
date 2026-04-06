import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfDay } from "date-fns";
import { Tv, AlertCircle, CalendarDays, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import OnboardingModal from "../components/guide/OnboardingModal";
import Header from "../components/guide/Header";
import ChannelCard from "../components/guide/ChannelCard";
import LoadingSkeleton from "../components/guide/LoadingSkeleton";
import SchedulePicker from "../components/guide/SchedulePicker";
import DonationBanner from "../components/guide/DonationBanner";
import ServiceTabs, { SERVICES } from "../components/guide/ServiceTabs";

const STORAGE_KEY = "channel_guide_profile";

function getStoredProfile() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

const SERVICE_PROMPTS = {
  netflix: "Netflix",
  hulu: "Hulu",
  max: "Max (HBO Max)",
  amazon: "Amazon Prime Video",
  appletv: "Apple TV+",
  peacock: "Peacock",
  paramount: "Paramount+",
  disney: "Disney+",
  livetv: "Live TV (cable and broadcast channels like NBC, CBS, ABC, Fox, ESPN, CNN, etc.)",
};

function buildServicePrompt(serviceId, profile) {
  const now = new Date();
  const currentTime = format(now, "h:mm a");
  const currentDay = format(now, "EEEE, MMMM d, yyyy");
  const serviceName = SERVICE_PROMPTS[serviceId];

  let prompt = `You are an expert streaming guide. It is currently ${currentTime} on ${currentDay}.
Generate the top 25 most popular and recommended titles currently available on ${serviceName}.`;

  if (serviceId === "livetv") {
    prompt += ` Focus on what is live right now across major broadcast and cable channels.`;
  } else {
    prompt += ` Focus on what is trending, newly released, or highly rated on ${serviceName} right now.`;
  }

  if (profile?.name) prompt += ` The viewer's name is ${profile.name}.`;
  if (profile?.birthday) {
    const age = Math.floor((now - new Date(profile.birthday)) / (365.25 * 24 * 60 * 60 * 1000));
    prompt += ` They are ${age} years old — tailor recommendations accordingly.`;
  }
  if (profile?.location) prompt += ` They are in ${profile.location}.`;

  prompt += `\n\nFor each entry: rank (1-25), channel_name (show/movie title), current_show (episode or subtitle if any), type ("live"/"streaming"/"on-demand"), genre (News/Sports/Movies/Comedy/Drama/Kids/Documentary/Music/Reality/Sci-Fi/Thriller/Horror/Action), description (max 12 words), rating (e.g. "8.5/10").`;

  return prompt;
}

const JSON_SCHEMA = {
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
};

export default function Guide() {
  const [profile, setProfile] = useState(getStoredProfile());
  const [showOnboarding, setShowOnboarding] = useState(!profile);

  // Per-service cache: { netflx: [...], hulu: [...], ... }
  const [serviceCache, setServiceCache] = useState({});
  const [activeService, setActiveService] = useState("netflix");
  const [serviceLoading, setServiceLoading] = useState(false);

  // Schedule
  const [scheduleDate, setScheduleDate] = useState(startOfDay(new Date()));
  const [scheduleHour, setScheduleHour] = useState(new Date().getHours());
  const [scheduleChannels, setScheduleChannels] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const fetchService = useCallback(async (serviceId, force = false) => {
    if (!force && serviceCache[serviceId]) return; // already loaded
    setServiceLoading(true);
    const prompt = buildServicePrompt(serviceId, profile);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: JSON_SCHEMA,
    });
    setServiceCache((prev) => ({ ...prev, [serviceId]: result.channels || [] }));
    setServiceLoading(false);
  }, [profile, serviceCache]);

  // Load first tab on mount
  useEffect(() => {
    if (profile) fetchService("netflix");
  }, [profile]);

  const handleTabSelect = (serviceId) => {
    setActiveService(serviceId);
    fetchService(serviceId);
  };

  const handleRefresh = () => {
    setServiceCache((prev) => ({ ...prev, [activeService]: undefined }));
    fetchService(activeService, true);
  };

  const handleOnboardingComplete = (newProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
    setShowOnboarding(false);
  };

  const fetchSchedule = useCallback(async (date, hour) => {
    setScheduleLoading(true);
    const useDate = date || scheduleDate;
    const useHour = hour !== undefined ? hour : scheduleHour;
    const h = useHour % 12 || 12;
    const ampm = useHour < 12 ? "AM" : "PM";
    const dateLabel = format(useDate, "EEEE, MMMM d, yyyy");

    const prompt = `You are an expert TV and media guide. Generate the top 25 channel/content picks for ${h}:00 ${ampm} on ${dateLabel}.
Include live TV, streaming, and on-demand options. rank (1-25), channel_name, current_show, type ("live"/"streaming"/"on-demand"), genre, description (max 12 words), rating.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: JSON_SCHEMA,
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

  const activeChannels = serviceCache[activeService] || [];
  const activeServiceInfo = SERVICES.find((s) => s.id === activeService);

  return (
    <div className="min-h-screen bg-background font-body">
      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
      <Header profile={profile} onEditProfile={() => setShowOnboarding(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              {profile?.name ? `${profile.name}'s Guide` : "What's On Now"}
            </h2>
            <p className="text-muted-foreground font-body text-sm mt-2 max-w-xl">
              AI-curated top 25 picks per streaming service, always running in the background.
              {profile?.location && ` Tuned for ${profile.location}.`}
            </p>
          </div>
        </div>

        {/* Service Tabs */}
        <ServiceTabs activeService={activeService} onSelect={handleTabSelect} />

        {/* Refresh + label row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeServiceInfo?.emoji}</span>
            <h3 className="font-heading font-semibold text-foreground">
              Top 25 on <span className={activeServiceInfo?.color}>{activeServiceInfo?.label}</span>
            </h3>
          </div>
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={serviceLoading}
            className="h-8 px-4 text-xs font-heading font-semibold bg-gradient-to-r from-primary to-accent text-white rounded-lg gap-1.5 hover:opacity-90"
          >
            <Sparkles className="w-3 h-3" />
            {serviceLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Channel grid */}
        {serviceLoading ? (
          <LoadingSkeleton count={25} />
        ) : activeChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {activeChannels.map((channel, i) => (
              <ChannelCard key={`${activeService}-${channel.rank}-${channel.channel_name}`} channel={channel} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Tv className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-foreground">Nothing loaded yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Click Refresh to load {activeServiceInfo?.label} picks</p>
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
              <span className="text-sm font-body">
                Loading schedule for {format(scheduleDate, "MMM d")} at {scheduleHour % 12 || 12}{scheduleHour < 12 ? "am" : "pm"}...
              </span>
            </div>
          )}

          {!scheduleLoading && scheduleChannels.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-body">
                Top 25 picks for <span className="text-foreground font-medium">{format(scheduleDate, "EEEE, MMM d")}</span> at{" "}
                <span className="text-foreground font-medium">{scheduleHour % 12 || 12}:00 {scheduleHour < 12 ? "AM" : "PM"}</span>
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