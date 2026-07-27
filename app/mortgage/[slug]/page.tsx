import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MortgageCalc from "@/components/MortgageCalc";
import { JsonLd, breadcrumbSchema, calculatorSchema, Faq, Disclaimer } from "@/components/seo";
import { amortize, monthlyPaymentC, toCents } from "@/lib/finance";
import { fmtC, fmtCents } from "@/lib/format";
import { AdUnit } from "@/components/Ads";

/** Loan amounts to pre-render. Each becomes its own indexable landing page. */
const AMOUNTS = [
  100000, 150000, 200000, 250000, 275000, 300000, 325000, 350000, 375000,
  400000, 425000, 450000, 475000, 500000, 550000, 600000, 650000, 700000,
  750000, 800000, 900000, 1000000,
];

const RATES = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5];
const TERMS = [15, 30];

function parseAmount(slug: string): number | null {
  const m = slug.match(/^(\d+)-mortgage-payment$/);
  if (!m) return null;
  const amount = Number(m[1]);
  return AMOUNTS.includes(amount) ? amount : null;
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ slug: `${a}-mortgage-payment` }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const amount = parseAmount(slug);
  if (!amount) return {};
  const label = fmtC(toCents(amount));
  const p30 = fmtCents(monthlyPaymentC(toCents(amount), 6.5, 360));
  return {
    title: `${label} Mortgage Payment — Monthly Cost at Today's Rates`,
    description: `A ${label} mortgage costs about ${p30}/month in principal and interest on a 30-year loan at 6.5%. See payments across rates from 5% to 7.5%, for 15 and 30-year terms.`,
    alternates: { canonical: `/mortgage/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const amount = parseAmount(slug);
  if (!amount) notFound();

  const amountC = toCents(amount);
  const label = fmtC(amountC);
  const path = `/mortgage/${slug}`;

  const ref30 = amortize(amount, 6.5, 360);
  const ref15 = amortize(amount, 6.5, 180);

  const faqs = [
    {
      q: `What is the monthly payment on a ${label} mortgage?`,
      a: `At 6.5% interest, a ${label} loan costs about ${fmtCents(ref30.paymentC)} per month on a 30-year term, or ${fmtCents(ref15.paymentC)} per month on a 15-year term — principal and interest only, before taxes and insurance.`,
    },
    {
      q: `How much interest will I pay on a ${label} mortgage?`,
      a: `Over a full 30-year term at 6.5%, total interest comes to about ${fmtC(ref30.totalInterestC)}. On a 15-year term at the same rate, total interest drops to about ${fmtC(ref15.totalInterestC)} — the shorter term nearly always saves six figures on loans this size.`,
    },
    {
      q: `What income do I need for a ${label} mortgage?`,
      a: `Using the common 28% housing-cost guideline, the ${fmtCents(ref30.paymentC)} P&I payment (plus roughly a quarter more for taxes and insurance) suggests a gross income of about ${fmtC(Math.round((ref30.paymentC * 1.25 * 12) / 0.28))} per year. Lenders also weigh your other debts, credit score, and down payment.`,
    },
  ];

  return (
    <div className="container">
      <JsonLd data={calculatorSchema(`${label} Mortgage Payment Calculator`, `Monthly payment on a ${label} mortgage across current rates and terms.`, path)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Mortgage Calculator", path: "/mortgage-calculator" },
          { name: `${label} Mortgage`, path },
        ])}
      />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Mortgage</div>
        <h1>{label} mortgage payment</h1>
        <p className="lede">
          Monthly principal &amp; interest on a {label} loan at rates from 5% to 7.5%. Taxes,
          insurance, and PMI add to these figures — use the calculator below to include them.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 8 }}>
        <table className="rates">
          <caption className="eyebrow" style={{ textAlign: "left", captionSide: "top", paddingBottom: 8 }}>
            Payment by rate and term
          </caption>
          <thead>
            <tr>
              <th scope="col">Interest rate</th>
              {TERMS.map((t) => (
                <th key={t} scope="col">{t}-year</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATES.map((r) => (
              <tr key={r} className={r === 6.5 ? "current" : undefined}>
                <td>
                  {r.toFixed(2)}%
                  {r === 6.5 ? <span className="current-tag">Current</span> : null}
                </td>
                {TERMS.map((t) => (
                  <td key={t} className="num">{fmtCents(monthlyPaymentC(amountC, r, t * 12))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Customize this loan</h2>
      <MortgageCalc preset={{ homePrice: Math.round(amount / 0.8), downPayment: Math.round(amount / 0.8) - amount, rate: 6.5, termYears: 30 }} />

      <Faq items={faqs} />

      <AdUnit slot="0000000001" />

      <h2>Other loan amounts</h2>
      <div className="related">
        {AMOUNTS.filter((a) => a !== amount)
          .slice(0, 12)
          .map((a) => (
            <Link key={a} href={`/mortgage/${a}-mortgage-payment`}>
              {fmtC(toCents(a))}
            </Link>
          ))}
      </div>

      <Disclaimer />
    </div>
  );
}
