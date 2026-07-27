import Link from "next/link";
import { JsonLd, SITE } from "@/components/seo";
import { AdUnit } from "@/components/Ads";

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "UrCalc",
  url: SITE,
};

const icons = {
  mortgage: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 18V9.8L10 3l7.5 6.8V18" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="7.5" y="13" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  auto: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 13.5l1.8-5h12.4l1.8 5v1.5H2v-1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="5.5" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.5" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 8.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  personal: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 16.5c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
};

const tools = [
  {
    href: "/mortgage-calculator",
    title: "Mortgage Calculator",
    tag: "Most used",
    icon: icons.mortgage,
    featured: true,
    desc: "P&I, taxes, insurance, PMI, HOA. Full amortization with yearly and monthly views.",
  },
  {
    href: "/auto-loan-calculator",
    title: "Auto Loan Calculator",
    icon: icons.auto,
    desc: "Monthly payment, total interest, and true cost of ownership. Trade-in and negative equity included.",
  },
  {
    href: "/personal-loan-calculator",
    title: "Personal Loan Calculator",
    icon: icons.personal,
    desc: "Origination fee and effective APR, so you can compare offers on the number that actually matters.",
  },
];

export default function Home() {
  return (
    <div className="container">
      <JsonLd data={siteSchema} />
      <div className="hero">
        <div className="hero-badge">Free · No ads on calculators · No registration</div>
        <h1>Calculate any loan.<br />Understand every payment.</h1>
        <p className="lede">
          Precise calculators for mortgages, auto loans, and personal loans. No rounding, no
          estimates — every figure calculated to the cent.
        </p>
      </div>

      <div className="tool-grid">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="tool-card">
            <div className={`tool-icon${t.featured ? " featured" : ""}`} style={{ color: t.featured ? "#F9F8F5" : "var(--ink)" }}>
              {t.icon}
            </div>
            <h3>
              {t.title}
              {t.tag ? <span className="tool-tag">{t.tag}</span> : null}
            </h3>
            <p>{t.desc}</p>
            <span className="tool-go">Open calculator →</span>
          </Link>
        ))}
      </div>

      <AdUnit slot="0000000002" />

      <div style={{ padding: "32px 0 48px", borderTop: "1px solid var(--line)", marginTop: 0 }}>
        <div className="eyebrow">Popular calculations</div>
        <div className="related" style={{ marginTop: 12 }}>
          {[350, 400, 500, 450, 600, 200].map((k) => (
            <Link key={k} href={`/mortgage/${k * 1000}-mortgage-payment`}>
              ${k}K mortgage payment
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
