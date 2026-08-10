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
      <div className="prose">
        <h2>The Complete Guide to Auto Loans</h2>
        <p>
          Financing a vehicle often involves more variables than most people realize. While the sticker price is the starting point, the true cost of an auto loan depends on your trade-in, negative equity, dealer fees, and sales taxes. 
        </p>
        
        <h3>Understanding the Math</h3>
        <p>
          Auto loan payments are calculated using the same amortization formula as a standard mortgage. However, the <em>principal</em> amount you are financing can be tricky to determine.
        </p>
        <p>
          <strong>Amount Financed = Vehicle Price + Fees + Sales Tax - Down Payment - Net Trade-In</strong>
        </p>
        <p>
          Your "Net Trade-In" is the value of your old car minus anything you still owe on it. If you owe more than the car is worth, you have "negative equity."
        </p>

        <h3>The Danger of Negative Equity</h3>
        <p>
          If you trade in a car that is "underwater" (you owe more than it's worth), the difference doesn't just disappear. The dealership will simply add that remaining debt to your new car loan. This means you will be paying interest on the old car's debt at the new loan's interest rate.
        </p>

        <h3>Sales Tax Variations</h3>
        <p>
          Sales tax rules vary by region. In many states and countries, you only pay sales tax on the <em>difference</em> between the new car price and your trade-in value. However, in some jurisdictions (like California in the US), you pay sales tax on the full purchase price regardless of your trade-in.
        </p>

        <h3>Choosing the Right Loan Term</h3>
        <p>
          Dealerships often push 72-month or 84-month loans because they drastically lower the monthly payment. However, cars are depreciating assets. A long loan means you will likely be underwater on the car for years, and you will pay significantly more in total interest. If a 60-month loan payment is too high, it's generally a sign that the car is too expensive for your budget.
        </p>
      </div>

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
