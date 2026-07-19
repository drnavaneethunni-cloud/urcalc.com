# UrCalc — Phase 1

US loan calculator platform. Next.js 15 App Router, TypeScript, zero runtime
dependencies beyond React. All 31 pages statically pre-rendered; ~114 KB first load.

## What's included
- Mortgage calculator: P&I, property tax, insurance, HOA, PMI with automatic
  drop at 80% LTV, extra payments with interest-saved comparison
- Auto loan calculator: trade-in, negative equity rollover, per-state sales-tax
  handling, fees, long-term warnings
- Personal loan calculator: origination fee, effective APR (bisection solver)
- 22 programmatic SEO pages (/mortgage/{amount}-mortgage-payment) with
  rate-by-term tables, tailored FAQs, and embedded calculator presets
- Full amortization schedules (yearly/monthly toggle), pure-SVG balance charts,
  shareable URLs, print/PDF mode
- Schema.org (WebApplication, FAQPage, BreadcrumbList, Organization, WebSite),
  sitemap.xml, robots.txt, llms.txt, canonical URLs
- Integer-cent math engine, 26 passing verification tests (tests/verify.ts)

## Deploy
1. `npm install && npm run build` locally to confirm.
2. Push to GitHub → import in Vercel → deploy. No env vars needed.
3. Point urcalc.com's DNS at the Vercel deployment.
4. Submit sitemap.xml in Google Search Console.

## Validation-gate metrics (check monthly in Search Console)
- Pages indexed (target: all 26 content pages by month 2)
- Total impressions trend
- Queries entering positions 10–30

## Phase 2 (only after the gate passes)
Refinance, extra-payment standalone, affordability, rent-vs-buy; then
auto-amount programmatic pages. Architecture already supports drop-in routes.
