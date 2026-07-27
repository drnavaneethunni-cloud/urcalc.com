import type { Metadata } from "next";
import Link from "next/link";
import AffordabilityCalc from "@/components/AffordabilityCalc";
import { JsonLd, calculatorSchema, breadcrumbSchema, Faq, Disclaimer } from "@/components/seo";

export const metadata: Metadata = {
  title: "How Much House Can I Afford? Affordability Calculator",
  description:
    "Free home affordability calculator using the standard 28/36 debt-to-income rule. Enter your income and debts to see the maximum home price you can afford.",
  alternates: { canonical: "/affordability-calculator" },
};

const faqs = [
  {
    q: "What is the 28/36 rule?",
    a: "It's the standard debt-to-income guideline most lenders use. Your housing payment (principal, interest, taxes, insurance, PMI, HOA) shouldn't exceed 28% of your gross monthly income — the front-end ratio. Your total debt payments, including housing, shouldn't exceed 36% — the back-end ratio. Lenders apply whichever is more restrictive for you.",
  },
  {
    q: "Why does my affordable home price go down if I add debt?",
    a: "The back-end ratio counts all your monthly debt payments, not just housing. A car loan or student loan payment eats into the 36% ceiling directly, which can force your affordable home price down even though your income hasn't changed — often more than a bigger down payment would help.",
  },
  {
    q: "Is this the same as pre-approval?",
    a: "No. This gives you a realistic estimate using standard industry ratios, but actual pre-approval also weighs your credit score, employment history, assets, and the specific lender's overlays. Use this to know roughly where you stand before you talk to a lender, not as a guarantee.",
  },
  {
    q: "Should I use the maximum I can afford?",
    a: "Not necessarily. This calculator shows the lending-industry ceiling, not a recommendation. Many buyers are more comfortable well under 28%, especially if income is variable or other savings goals matter. Treat the result as an upper bound to plan around, not a target.",
  },
];

export default function Page() {
  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          "Home Affordability Calculator",
          "Free home affordability calculator using the 28/36 debt-to-income rule, with front-end and back-end DTI breakdown.",
          "/affordability-calculator"
        )}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Affordability Calculator", path: "/affordability-calculator" }])} />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Affordability</div>
        <h1>How much house can I afford?</h1>
        <p className="lede">
          Based on your income, existing debts, and down payment — using the same 28/36
          debt-to-income guideline lenders use, with the full monthly breakdown shown.
        </p>
      </div>

      <AffordabilityCalc />
      <Faq items={faqs} />

      <h2>Related calculators</h2>
      <div className="related">
        <Link href="/mortgage-calculator">Mortgage calculator</Link>
        <Link href="/auto-loan-calculator">Auto loan calculator</Link>
        <Link href="/personal-loan-calculator">Personal loan calculator</Link>
      </div>

      <Disclaimer />
    </div>
  );
}
