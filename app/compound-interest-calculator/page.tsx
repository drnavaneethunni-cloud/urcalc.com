import type { Metadata } from "next";
import Link from "next/link";
import CompoundCalc from "@/components/CompoundCalc";
import { JsonLd, calculatorSchema, breadcrumbSchema, Disclaimer } from "@/components/seo";

export const metadata: Metadata = {
  title: "Compound Interest Calculator | Visualize Your Growth",
  description:
    "Free compound interest calculator. See how your money grows over time with monthly contributions and annual returns.",
  alternates: { canonical: "/compound-interest-calculator" },
};

export default function Page() {
  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          "Compound Interest Calculator",
          "Free compound interest calculator showing investment growth over time.",
          "/compound-interest-calculator"
        )}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Compound Interest", path: "/compound-interest-calculator" }])} />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Investing</div>
        <h1>Compound Interest Calculator</h1>
        <p className="lede">
          Watch your wealth grow. See how consistent contributions and the power of compounding can turn a small investment into a massive portfolio.
        </p>
      </div>

      <CompoundCalc />

      <div className="prose">
        <h2>The Power of Compounding</h2>
        <p>
          Compound interest is the interest on savings calculated on both the initial principal and the accumulated interest from previous periods. It's often called the "eighth wonder of the world" because of its ability to exponentially grow wealth over long periods.
        </p>
      </div>

      <h2>Related calculators</h2>
      <div className="related">
        <Link href="/roi-calculator">ROI calculator</Link>
        <Link href="/mortgage-calculator">Mortgage calculator</Link>
      </div>

      <Disclaimer />
    </div>
  );
}
