import type { Metadata } from "next";
import Link from "next/link";
import PersonalCalc from "@/components/PersonalCalc";
import { JsonLd, calculatorSchema, breadcrumbSchema, Faq, Disclaimer } from "@/components/seo";

export const metadata: Metadata = {
  title: "Personal Loan Calculator with Origination Fee & True APR",
  description:
    "Free personal loan calculator that includes origination fees and shows your effective APR — the number that actually matters when comparing loan offers.",
  alternates: { canonical: "/personal-loan-calculator" },
};

const faqs = [
  {
    q: "What is an origination fee on a personal loan?",
    a: "An origination fee is a one-time charge, usually 0%–10% of the loan amount, that most online lenders deduct from your disbursement. If you borrow $10,000 with a 5% fee, you receive $9,500 but repay interest on the full $10,000. Always compare loans by effective APR, which accounts for the fee.",
  },
  {
    q: "What credit score do I need for a personal loan?",
    a: "Many lenders approve scores from around 580–600, but rates improve sharply above 670 and again above 740. If your score is borderline, compare offers from credit unions, which often price more favorably than online lenders for fair-credit borrowers.",
  },
  {
    q: "Is a personal loan better than a credit card?",
    a: "For carrying a balance, usually yes: personal loan APRs are typically well below credit card rates, payments are fixed, and there's a defined payoff date. For purchases you can pay off within a month, a card with no interest charged is cheaper.",
  },
  {
    q: "Can I pay off a personal loan early?",
    a: "Most personal loans have no prepayment penalty, so extra payments go straight to principal and shorten the loan. Use the extra payment field above to see the exact interest saved — but confirm your lender's prepayment terms first.",
  },
];

export default function Page() {
  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          "Personal Loan Calculator",
          "Personal loan payment calculator with origination fees, effective APR, extra payments, and a full amortization schedule.",
          "/personal-loan-calculator"
        )}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Personal Loan Calculator", path: "/personal-loan-calculator" }])} />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Personal</div>
        <h1>Personal loan calculator</h1>
        <p className="lede">
          Includes what most calculators skip: the origination fee, and the effective APR that
          tells you which offer is actually cheaper.
        </p>
      </div>

      <PersonalCalc />
      <div className="prose">
        <h2>The Complete Guide to Personal Loans</h2>
        <p>
          Personal loans are unsecured loans, meaning they aren't backed by collateral like a house or a car. Because of this, lenders take on more risk, which often translates to higher interest rates compared to auto loans or mortgages. However, they are highly flexible and can be used for debt consolidation, home improvements, or unexpected expenses.
        </p>
        
        <h3>The Hidden Cost: Origination Fees</h3>
        <p>
          Many online lenders charge an "origination fee" to process your personal loan. This is usually a percentage of the loan amount, typically ranging from 1% to 10%.
        </p>
        <p>
          The critical thing to understand about origination fees is that they are usually deducted from your loan disbursement. If you borrow $10,000 and the lender charges a 5% origination fee ($500), you will only receive $9,500 in your bank account. However, you will still make payments and accrue interest based on the full $10,000 borrowed.
        </p>

        <h3>Effective APR: The Metric That Matters</h3>
        <p>
          Because of origination fees, looking at just the "interest rate" is misleading. The Annual Percentage Rate (APR) incorporates both the interest rate and the fees to give you the true annualized cost of borrowing.
        </p>
        <p>
          Our calculator computes the <strong>Effective APR</strong> by determining the rate that makes the present value of your payments equal to the cash you actually received (the loan amount minus the fee). This is the only number you should use when comparing loan offers from different lenders. A loan with a lower interest rate but a high fee can be much more expensive than a loan with a slightly higher rate but zero fees.
        </p>

        <h3>Debt Consolidation Strategies</h3>
        <p>
          One of the most common uses for personal loans is consolidating high-interest credit card debt. When considering this, run your numbers through the calculator to ensure the monthly payment is affordable, and most importantly, compare the total interest paid over the life of the personal loan versus keeping the debt on credit cards.
        </p>
      </div>

      <h2>Related calculators</h2>
      <div className="related">
        <Link href="/mortgage-calculator">Mortgage calculator</Link>
        <Link href="/auto-loan-calculator">Auto loan calculator</Link>
        <Link href="/affordability-calculator">Affordability calculator</Link>
      </div>

      <Disclaimer />
    </div>
  );
}
