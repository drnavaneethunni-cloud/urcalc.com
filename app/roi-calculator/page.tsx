import type { Metadata } from "next";
import Link from "next/link";
import RoiCalc from "@/components/RoiCalc";
import { JsonLd, calculatorSchema, breadcrumbSchema, Disclaimer } from "@/components/seo";

export const metadata: Metadata = {
  title: "ROI Calculator | Return on Investment with Annualized Yield",
  description:
    "Free ROI calculator. Calculate your net profit, total return on investment, and annualized ROI to accurately compare investments.",
  alternates: { canonical: "/roi-calculator" },
};

export default function Page() {
  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          "ROI Calculator",
          "Free Return on Investment (ROI) calculator showing total return and annualized yield.",
          "/roi-calculator"
        )}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "ROI Calculator", path: "/roi-calculator" }])} />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Investing</div>
        <h1>ROI Calculator</h1>
        <p className="lede">
          Calculate your Return on Investment. Discover your total profit and see your annualized yield to accurately compare different assets over time.
        </p>
      </div>

      <RoiCalc />

      <div className="prose">
        <h2>Understanding Return on Investment (ROI)</h2>
        <p>
          Return on Investment (ROI) is a performance measure used to evaluate the efficiency or profitability of an investment. It is the ratio of net profit to the total cost of the investment.
        </p>
        
        <h3>Why Annualized ROI Matters</h3>
        <p>
          Total ROI tells you how much money you made, but it doesn't tell you how long it took. Earning a 50% ROI over one year is incredible, but earning a 50% ROI over ten years is just okay. Annualized ROI solves this by showing you the equivalent annual growth rate, allowing you to compare investments held for different periods.
        </p>
      </div>

      <h2>Related calculators</h2>
      <div className="related">
        <Link href="/compound-interest-calculator">Compound interest calculator</Link>
        <Link href="/mortgage-calculator">Mortgage calculator</Link>
      </div>

      <Disclaimer />
    </div>
  );
}
