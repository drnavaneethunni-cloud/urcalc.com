import type { Metadata } from "next";
import Link from "next/link";
import MortgageCalc from "@/components/MortgageCalc";
import { JsonLd, calculatorSchema, breadcrumbSchema, Faq, Disclaimer } from "@/components/seo";

export const metadata: Metadata = {
  title: "Mortgage Calculator with PMI, Taxes & Extra Payments",
  description:
    "Free mortgage calculator with property taxes, home insurance, PMI, and HOA fees. See your full monthly payment, amortization schedule, and how extra payments cut years off your loan.",
  alternates: { canonical: "/mortgage-calculator" },
};

const faqs = [
  {
    q: "How much house can I afford?",
    a: "A common guideline is to keep your total housing payment — principal, interest, taxes, and insurance — under 28% of your gross monthly income, and total debt payments under 36%. Enter different home prices above to see what payment each produces, then compare it to your income.",
  },
  {
    q: "What is PMI and when does it go away?",
    a: "Private mortgage insurance (PMI) is required on most conventional loans when your down payment is under 20%. It typically costs 0.3%–1.5% of the loan amount per year. By federal law, PMI must be cancelled automatically when your balance reaches 78% of the original home value, and you can request removal at 80%. This calculator drops PMI at the 80% mark.",
  },
  {
    q: "Should I choose a 15-year or 30-year mortgage?",
    a: "A 15-year loan carries a lower rate and dramatically less total interest, but the required payment is much higher. A 30-year loan keeps payments manageable and you can still pay it faster voluntarily — use the extra payment field to see how a 30-year loan with extra payments compares.",
  },
  {
    q: "How do extra payments reduce my interest?",
    a: "Every extra dollar goes straight to principal, so all future interest is charged on a smaller balance. On a typical 30-year loan, even $100–$200 extra per month can remove several years of payments and tens of thousands of dollars in interest. The calculator shows your exact savings.",
  },
  {
    q: "Does this calculator include property taxes and insurance?",
    a: "Yes. Enter your annual property tax and homeowners insurance and the calculator splits them into monthly amounts, the same way a lender's escrow account does. National averages are prefilled, but rates vary widely by state and county.",
  },
];

export default function Page() {
  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          "Mortgage Calculator",
          "Free mortgage payment calculator with PMI, property taxes, insurance, HOA, amortization schedule, and extra payment savings.",
          "/mortgage-calculator"
        )}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Mortgage Calculator", path: "/mortgage-calculator" }])} />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Mortgage</div>
        <h1>Mortgage calculator</h1>
        <p className="lede">
          Your complete monthly payment — principal, interest, taxes, insurance, PMI, and HOA —
          with a full amortization schedule and exact savings from extra payments.
        </p>
      </div>

      <MortgageCalc />

      <h2>Common loan amounts</h2>
      <div className="related">
        {[250, 300, 350, 400, 450, 500, 600, 750].map((k) => (
          <Link key={k} href={`/mortgage/${k * 1000}-mortgage-payment`}>
            ${k}K mortgage
          </Link>
        ))}
      </div>

      <Faq items={faqs} />

      <h2>Related calculators</h2>
      <div className="related">
        <Link href="/auto-loan-calculator">Auto loan calculator</Link>
        <Link href="/personal-loan-calculator">Personal loan calculator</Link>
        <Link href="/affordability-calculator">Affordability calculator</Link>
      </div>

      <Disclaimer />
    </div>
  );
}
