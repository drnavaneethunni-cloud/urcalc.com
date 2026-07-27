import type { Metadata } from "next";
import Link from "next/link";
import AutoCalc from "@/components/AutoCalc";
import { JsonLd, calculatorSchema, breadcrumbSchema, Faq, Disclaimer } from "@/components/seo";

export const metadata: Metadata = {
  title: "Auto Loan Calculator with Trade-In, Tax & Fees",
  description:
    "Free car loan calculator with trade-in value, negative equity, sales tax, and dealer fees. See your true monthly payment, total interest, and full payoff schedule.",
  alternates: { canonical: "/auto-loan-calculator" },
};

const faqs = [
  {
    q: "What is a good interest rate for a car loan?",
    a: "Rates depend on credit score, loan term, and whether the car is new or used. Borrowers with excellent credit often qualify for rates several points below the average, while subprime rates can run into the double digits. Always compare a pre-approved offer from a bank or credit union against dealer financing.",
  },
  {
    q: "Should I take a 72 or 84-month car loan?",
    a: "Longer terms lower the monthly payment but raise total interest substantially, and cars depreciate faster than long loans amortize — meaning you can owe more than the car is worth for years. If you need 72+ months to afford the payment, the purchase price is usually the real problem.",
  },
  {
    q: "How does a trade-in with negative equity work?",
    a: "If you owe more on your current car than its trade-in value, the difference (negative equity) is added to your new loan. You end up financing the old car's leftover debt at the new loan's rate. This calculator shows exactly how much negative equity rolls in.",
  },
  {
    q: "Is sales tax charged on the full price or after trade-in?",
    a: "In most states, sales tax applies to the price after your trade-in credit is deducted. A few states, including California, tax the full purchase price regardless of trade-in. Toggle the setting in the calculator to match your state.",
  },
];

export default function Page() {
  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          "Auto Loan Calculator",
          "Car payment calculator with trade-in, negative equity, sales tax, fees, and a complete amortization schedule.",
          "/auto-loan-calculator"
        )}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Auto Loan Calculator", path: "/auto-loan-calculator" }])} />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Auto</div>
        <h1>Auto loan calculator</h1>
        <p className="lede">
          The payment the dealer's quote hides: trade-in, negative equity, sales tax, and fees
          all included, with total interest over the life of the loan.
        </p>
      </div>

      <AutoCalc />
      <Faq items={faqs} />

      <h2>Related calculators</h2>
      <div className="related">
        <Link href="/mortgage-calculator">Mortgage calculator</Link>
        <Link href="/personal-loan-calculator">Personal loan calculator</Link>
        <Link href="/affordability-calculator">Affordability calculator</Link>
      </div>

      <Disclaimer />
    </div>
  );
}
