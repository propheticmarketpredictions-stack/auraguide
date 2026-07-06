# AuraGuide

An AI-powered TV and streaming schedule guide that generates personalized "what's on now" picks across your favorite services.

## What it does

- **Personalized onboarding** — a first-run modal collects your name, birthday, and location (stored locally in the browser) so recommendations can be tailored to you.
- **Service tabs** — browse the top titles currently trending on 10 sources: Netflix, Hulu, Max, Prime Video, Apple TV+, Peacock, Paramount+, Disney+, Pluto TV, and Live TV. Each tab is generated on demand and cached.
- **Time-travel schedule** — pick any date and hour with the schedule picker and get the top 25 channel/content picks for that moment across live, streaming, and on-demand.
- **Filtering** — narrow results by media type (Live TV / Streaming / On Demand) and by how many picks to show.
- **Live-aware results** — each request pulls current context so picks reflect what is airing or trending right now, returned as structured cards with rank, title, current show, genre, a short description, and a rating.
- **Refresh** — regenerate any tab or schedule on demand.
- **Donation banner** — optional in-app support links (PayPal, CashApp).

## AI Stack

AI picks run via **Base44's `Core.InvokeLLM` integration**. Model: **Google Gemini** (`gemini_3_flash`), with live internet context.

## Tech stack

- **React 18** + **Vite 6**
- **Base44 SDK** (`@base44/sdk`) — backend, auth, and the `InvokeLLM` integration
- **Tailwind CSS** with **Radix UI** primitives and **lucide-react** icons
- **Framer Motion** for animation
- **React Router** for routing
- **date-fns** for date handling

## Project structure

```
src/
  api/base44Client.js      Base44 SDK client setup
  pages/Guide.jsx          Main guide: prompts, LLM calls, JSON schema, state
  components/guide/         Feature UI
    OnboardingModal.jsx    Name / birthday / location capture
    ServiceTabs.jsx        Streaming-service selector (SERVICES list)
    ChannelCard.jsx        Rendered result card
    SchedulePicker.jsx     Date + hour picker
    FilterBar.jsx          Media-type and count filters
    Header.jsx             App header
    DonationBanner.jsx     Support links
    LoadingSkeleton.jsx    Loading state
  components/ui/           Reusable Radix/Tailwind UI components
  lib/, hooks/, utils/    Auth context, query client, helpers
base44/
  config.jsonc            App + build config
  entities/User.jsonc     User entity schema
```

## Local development

```bash
npm install
```

Create an `.env.local` file with your Base44 app credentials:

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
```

Run the dev server:

```bash
npm run dev
```

## Publishing

Any change pushed to the repo is reflected in the Base44 Builder. To publish, open [Base44.com](https://base44.com) and click **Publish**.
