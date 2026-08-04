import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ConsentBanner } from "@/components/Ads";
import { ADSENSE_CLIENT_ID, CONSENT_DEFAULT_SCRIPT } from "@/lib/adsConfig";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const SITE = "https://urcalc.com"; // TODO: replace with the live domain before deploy

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "UrCalc — Free Mortgage, Auto & Personal Loan Calculators",
    template: "%s | UrCalc",
  },
  description:
    "Free, accurate loan calculators for US borrowers. Estimate monthly payments, see full amortization schedules, and understand exactly where every dollar goes.",
  openGraph: {
    siteName: "UrCalc",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UrCalc",
  url: SITE,
  logo: `${SITE}/apple-icon.png`,
  description:
    "Free loan calculators with transparent formulas: mortgage, auto loan, and personal loan payment tools for US borrowers.",
  // TODO: add real social profile URLs here once they exist, e.g.
  // sameAs: ["https://twitter.com/urcalc", "https://www.linkedin.com/company/urcalc"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "UrCalc",
  url: SITE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={inter.variable}>
      <head>
        {ADSENSE_CLIENT_ID ? (
          <>
            <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
            />
          </>
        ) : null}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              <span className="mark" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                  <rect x="4.2" y="12.6" width="2.15" height="3.4" rx="1.05" fill="#F9F8F5" />
                  <rect x="7.35" y="9.9" width="2.15" height="6.1" rx="1.05" fill="#F9F8F5" />
                  <rect x="10.5" y="7.1" width="2.15" height="8.9" rx="1.05" fill="#F9F8F5" />
                  <rect x="13.65" y="4.3" width="2.15" height="11.7" rx="1.05" fill="#F9F8F5" />
                </svg>
              </span>
              UrCalc
            </Link>
            <nav className="site-nav" aria-label="Main">
              <Link href="/mortgage-calculator">Mortgage</Link>
              <Link href="/auto-loan-calculator">Auto Loan</Link>
              <Link href="/personal-loan-calculator">Personal Loan</Link>
              <Link href="/affordability-calculator">Affordability</Link>
            </nav>
            <Link href="/mortgage-calculator" className="nav-cta">Open calculator</Link>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <div>
              UrCalc provides educational estimates, not financial advice. Results are
              approximations; confirm exact figures with your lender before making decisions.
            </div>
            <div>© {new Date().getFullYear()} UrCalc. All calculations run in your browser — no financial data is sent to our servers.</div>
            <div className="footer-links">
              <Link href="/about">About &amp; Methodology</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </footer>
        <ConsentBanner />
      </body>
    </html>
  );
}
