import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RentVsBuyCalc from "@/components/RentVsBuyCalc";
import { JsonLd, breadcrumbSchema, calculatorSchema, Faq, Disclaimer } from "@/components/seo";
import { fmtC } from "@/lib/format";
import { AdUnit } from "@/components/Ads";

/** Fixed price points to pre-render. Each becomes its own indexable landing page. */
const PRICES = [
  150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 600000, 750000, 900000, 1000000,
];

/** Rent estimate is derived from a stated price-to-rent ratio assumption, not real local
 *  market data — every price-point page says so explicitly. */
const ASSUMED_PRICE_TO_RENT = 16;
const ASSUMED_DOWN_PCT = 20;
const ASSUMED_BUY_CLOSING_PCT = 3;
const ASSUMED_SELL_PCT = 7;

function parsePrice(slug: string): number | null {
  const m = slug.match(/^(\d+)-home$/);
  if (!m) return null;
  const amount = Number(m[1]);
  return PRICES.includes(amount) ? amount : null;
}

function estimateRent(price: number): number {
  return Math.round(price / (ASSUMED_PRICE_TO_RENT * 12) / 5) * 5;
}

export function generateStaticParams() {
  return PRICES.map((p) => ({ slug: `${p}-home` }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const price = parsePrice(slug);
  if (!price) return {};
  const label = fmtC(price * 100);
  const rent = estimateRent(price);
  return {
    title: `Rent vs. Buy on a ${label} Home`,
    description: `Should you rent or buy a ${label} home? Full financial model pre-filled with an estimated ${fmtC(rent * 100)}/mo rent, plus a preference questionnaire for what the math can't capture.`,
    alternates: { canonical: `/rent-vs-buy/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const price = parsePrice(slug);
  if (!price) notFound();

  const label = fmtC(price * 100);
  const path = `/rent-vs-buy/${slug}`;
  const rent = estimateRent(price);
  const down = Math.round((price * ASSUMED_DOWN_PCT) / 100);
  const buyClosing = Math.round((price * ASSUMED_BUY_CLOSING_PCT) / 100);
  const sellClosing = Math.round((price * ASSUMED_SELL_PCT) / 100);

  const faqs = [
    {
      q: `What rent is comparable to a ${label} home?`,
      a: `This page pre-fills ${fmtC(rent * 100)}/month, based on an assumed price-to-rent ratio of ${ASSUMED_PRICE_TO_RENT} — a stated assumption, not real local market data for any specific area. Rents for a comparable home vary widely by city and neighborhood, so replace this figure with an actual local listing before trusting the result.`,
    },
    {
      q: `How much is a typical down payment on a ${label} home?`,
      a: `At a common 20% down payment, that's ${fmtC(down * 100)} up front, before closing costs. The calculator below lets you change this percentage — a smaller down payment frees up cash but increases what you finance.`,
    },
    {
      q: `What are closing and selling costs on a ${label} home?`,
      a: `At assumed rates of ${ASSUMED_BUY_CLOSING_PCT}% buying and ${ASSUMED_SELL_PCT}% selling, that's roughly ${fmtC(buyClosing * 100)} to close on the purchase and about ${fmtC(sellClosing * 100)} in selling costs (agent commission and closing fees) if the home is later sold at the same price — more if it's appreciated by then, since selling costs scale with sale price.`,
    },
    {
      q: `Is ${ASSUMED_PRICE_TO_RENT} the right price-to-rent ratio for my market?`,
      a: `Probably not exactly. It's a round, stated assumption used to pre-fill this page, not a claim about any specific city. As a rough screen, a price-to-rent ratio under about 15 tends to favor buying and over about 21 tends to favor renting — check your area's actual ratio and enter your own rent figure in the calculator for a real answer.`,
    },
  ];

  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          `Rent vs. Buy on a ${label} Home`,
          `Rent-vs-buy comparison for a ${label} home, with an assumed price-to-rent ratio and full financial model.`,
          path
        )}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Rent vs. Buy Calculator", path: "/rent-vs-buy-calculator" },
          { name: `${label} Home`, path },
        ])}
      />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Rent vs. Buy</div>
        <h1>Rent vs. buy on a {label} home</h1>
        <p className="lede">
          Pre-filled with a {label} home price and an estimated {fmtC(rent * 100)}/month rent,
          based on an assumed {ASSUMED_PRICE_TO_RENT}:1 price-to-rent ratio — a stated assumption,
          not real data for your market. At a typical {ASSUMED_DOWN_PCT}% down payment, that's{" "}
          {fmtC(down * 100)} down and roughly {fmtC(buyClosing * 100)} in closing costs. Adjust any
          number below to match your actual numbers.
        </p>
      </div>

      <RentVsBuyCalc preset={{ homePrice: price, monthlyRent: rent }} />

      <Faq items={faqs} />

      <AdUnit slot="0000000004" />

      <h2>Other price points</h2>
      <div className="related">
        {PRICES.filter((p) => p !== price)
          .slice(0, 12)
          .map((p) => (
            <Link key={p} href={`/rent-vs-buy/${p}-home`}>
              {fmtC(p * 100)}
            </Link>
          ))}
      </div>

      <h2>Related</h2>
      <div className="related">
        <Link href="/rent-vs-buy-calculator">Rent vs. buy calculator</Link>
        <Link href="/guides/rent-vs-buy">Rent vs. buy guide</Link>
      </div>

      <Disclaimer />
    </div>
  );
}
