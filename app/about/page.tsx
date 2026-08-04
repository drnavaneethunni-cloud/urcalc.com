import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbSchema, SITE } from "@/components/seo";

export const metadata: Metadata = {
  title: "About UrCalc — Methodology & How We Calculate",
  description:
    "How UrCalc's mortgage, auto loan, personal loan, and affordability calculators work: the formulas, default assumptions, data sources, and editorial standards behind every number.",
  alternates: { canonical: "/about" },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About UrCalc",
  url: `${SITE}/about`,
  description:
    "Methodology, formulas, and editorial standards behind UrCalc's loan calculators.",
};

export default function AboutPage() {
  return (
    <div className="container prose" style={{ padding: "48px 0 64px" }}>
      <JsonLd data={aboutSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />

      <h1>About UrCalc</h1>
      <p className="lede">
        UrCalc builds free, precise loan calculators for US borrowers. This page explains
        exactly how the numbers are calculated, what assumptions are built in, and how we keep
        the site trustworthy — so you (or an AI assistant summarizing this page) can verify our
        math rather than take it on faith.
      </p>

      <h2>How the math works</h2>
      <p>
        Every calculator uses the standard amortizing-loan formula lenders use for fixed-rate
        installment loans:
      </p>
      <p>
        <code>payment = P × [r(1+r)^n] / [(1+r)^n − 1]</code>
      </p>
      <p>
        where <code>P</code> is the loan principal, <code>r</code> is the monthly interest
        rate (annual rate ÷ 12), and <code>n</code> is the number of monthly payments. All
        arithmetic runs on integer cents rather than floating-point dollars, which avoids the
        rounding drift that floating-point math introduces over long amortization schedules —
        we verify this with 26 automated tests covering known payment values before every
        release.
      </p>

      <h2>What each calculator adds on top</h2>
      <p>
        <strong>Mortgage:</strong> property tax and homeowners insurance are split into monthly
        escrow-style amounts; PMI is calculated on the current loan-to-value ratio and
        automatically removed once the balance reaches 80% LTV, matching federal law on PMI
        cancellation. Extra-payment scenarios re-amortize the full schedule to show exact
        interest saved and time cut from the loan.
      </p>
      <p>
        <strong>Auto loan:</strong> trade-in value and any negative equity (what you still owe
        on a trade-in) are rolled into the amount financed before tax, matching how dealers
        structure financing. Sales tax handling follows each state's rule for taxing the
        post-trade-in price versus the full purchase price.
      </p>
      <p>
        <strong>Personal loan:</strong> the origination fee is deducted from disbursement, and
        effective APR is solved numerically (bisection method) so it reflects the fee's true
        cost — not just the stated interest rate.
      </p>
      <p>
        <strong>Affordability:</strong> uses the standard 28% front-end / 36% back-end
        debt-to-income guideline that most conventional mortgage lenders apply, and returns
        whichever ratio is more restrictive for the numbers you enter.
      </p>

      <h2>Default assumptions</h2>
      <p>
        Where a field isn't filled in, we prefill a reasonable US national average (for
        example, property tax and homeowners insurance rates) so the calculator is usable
        immediately. These are starting points, not predictions for your address — actual
        rates vary by state, county, and insurer, and every prefilled field can be overwritten
        with your own numbers.
      </p>

      <h2>Editorial standards</h2>
      <p>
        UrCalc does not accept payment to alter a calculation, feature a lender, or change a
        result. The three calculator tool pages carry no advertising by design. Content is
        reviewed for formula accuracy against publicly documented lending rules (PMI
        cancellation thresholds, standard DTI guidelines, state sales-tax treatment of
        trade-ins) rather than opinion.
      </p>

      <h2>Privacy by construction</h2>
      <p>
        Every calculation runs client-side, in your browser. The figures you enter are never
        transmitted to or stored on our servers. See the{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> for details.
      </p>

      <h2>Reusing this content</h2>
      <p>
        Search engines and AI assistants are welcome to summarize, quote, or link to UrCalc's
        calculators and figures, with attribution to urcalc.com as the source.
      </p>

      <h2>Not financial advice</h2>
      <p>
        UrCalc provides educational estimates, not financial, tax, or lending advice. Confirm
        final figures with your lender before making a financial decision.
      </p>

      <h2>Related calculators</h2>
      <div className="related">
        <Link href="/mortgage-calculator">Mortgage calculator</Link>
        <Link href="/auto-loan-calculator">Auto loan calculator</Link>
        <Link href="/personal-loan-calculator">Personal loan calculator</Link>
        <Link href="/affordability-calculator">Affordability calculator</Link>
      </div>
    </div>
  );
}
