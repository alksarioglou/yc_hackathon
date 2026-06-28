# Ad Astra

**With Ad Astra you can advertise your product in the sky — a drone swarm draws a scannable QR code right above your buyers.**

> Hackathon track: **Sales Cyborgs — AI-Enhanced Sales**

Paste a product URL. Our AI reads your product, builds your Ideal Customer Profile, finds the real people who match it, and pinpoints the one place and moment where they physically cluster. Then a fleet of drones assembles into a scannable QR code in the sky above them — precision geo-targeting for the real world.

---

## The problem

Ads are everywhere, so people see nothing. Your ICP has tuned out LinkedIn, scrolls past paid social, never opens the email, and lives behind an ad blocker. The digital channels are saturated and ignored.

Ad Astra reaches people in the one place that has no ad inventory and no banner blindness: **the sky**. A QR code appears above you the moment you step out of the office and look up — and out of pure curiosity, you scan it.

## How it works

1. **Understand the product** — You paste a product URL. We fetch the page and use **OpenAI** to extract the product, its core value, and a detailed Ideal Customer Profile. You can edit the ICP before continuing.
2. **Find the leads** — We turn the ICP into a search and pull real target companies from **Fiber AI**, then real decision-makers (with their LinkedIn profiles) from **Orange Slice**.
3. **Pick the place, time & moment** — OpenAI reasons over the real geographic data to find the densest cluster of leads in a city, then chooses the best time and vantage point to fly — and explains why (e.g. office windows 10 minutes before clock-out).
4. **See the campaign in 3D** — We render a photorealistic 3D simulation of the exact location with the drone swarm forming a real, scannable QR code in the sky, lit for the chosen time of day.
5. **Launch & measure** — After a one-click checkout, we hand off to **Lopus** to track how the campaign converts to pipeline and revenue, closing the loop from impression to deal.

## Notable feature

**Real-time 3D campaign simulation** — a photorealistic preview of the actual drone-QR takeover over the real city, built to convert the customer on the spot.

## Why we built this

Advertising keeps climbing: flyers → billboards → TV → social. We wanted to take the next leap — to a cosmic level: the sky. And then, we are aiming for space.

The name says it: **Ad Astra** is Latin for "to the stars," and "Ad" is also "advertisement." We set out to move advertising to a new altitude. The big vision is literally cosmic — one day, enough orbital material could block starlight to render a QR code across the night sky, making Ad Astra the first advertising channel for humans on Mars. We came back down to Earth and started with drones, but the direction is up.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **AI:** OpenAI — product analysis, ICP generation, targeting reasoning
- **Lead data:** Fiber AI (company search) + Orange Slice (LinkedIn decision-makers)
- **Conversion tracking:** Lopus (post-campaign attribution)
- **3D simulation:** Google Photorealistic 3D Tiles & Street View (`@vis.gl/react-google-maps`), Cesium / Cesium ion, Esri building data, Three.js + React Three Fiber (drei, postprocessing) for the drone swarm, `qrcode` for the scannable matrix
- **Backend:** Next.js Route Handlers; Convex for data/state

### Built with our sponsors

| Sponsor | Role in Ad Astra |
| --- | --- |
| **OpenAI** | Reads the product, writes the ICP, reasons about where & when to fly |
| **Fiber AI** | Finds real companies that match the ICP |
| **Orange Slice** | Finds the real decision-makers (with LinkedIn profiles) at those companies |
| **Lopus** | Tracks how the campaign converts to pipeline and revenue |

## Getting started

### 1. Install

```bash
npm install
```

> `postinstall` runs `scripts/setup-cesium.mjs` to stage the Cesium assets.

### 2. Configure environment

Create `.env.local` in the project root:

```bash
# AI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Lead data
FIBER_API_KEY=sk_live_...
ORANGESLICE_API_KEY=osk_...          # provisioned via `npx orangeslice login`

# 3D simulation
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...  # Maps JS + Photorealistic 3D Tiles + Street View

# Convex (auto-generated on first `npx convex dev`)
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a product URL.

## Project structure

```
convex/              # Convex backend (schema, functions)
src/app/             # Next.js App Router pages + API route handlers
  api/               # analyze, leads, preview, pay
src/components/      # UI: flow steps, 3D preview, payment, console
  preview/           # Cesium + Google Maps 3D drone-QR simulation
src/lib/             # OpenAI, Fiber, Orange Slice, scraping, preview helpers
```

## Challenges we ran into

- **Wiring four sponsor APIs into one clean flow** — each behaves differently, so every step has graceful fallbacks; a single API hiccup never breaks the demo.
- **Lead-source taxonomy** — Fiber's filters accept a fixed industry taxonomy, so we constrain the AI to map any ICP onto valid industry + headcount filters, which is what makes the results genuinely on-target.
- **Orange Slice credits** — the web-search path hit a credit limit mid-build, so we pivoted to its LinkedIn-database endpoint and got better results: real, named decision-makers with profile links.
- **Lopus has no public API** — it's a demo-led platform, so instead of faking an integration we built an honest hand-off into it for conversion attribution.
- **A real, scannable QR in a photorealistic 3D city** — getting drones to form an actual scannable code over real Google 3D geometry, lit by time of day, took real work on the 3D pipeline.

---

*Ad Astra — to the stars.*
