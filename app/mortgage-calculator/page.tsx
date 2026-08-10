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

      <div className="prose">
        <h2>Complete Guide to Mortgage Calculations</h2>
        <p>
          Buying a home is one of the most significant financial decisions you'll ever make. Understanding exactly how your monthly payment is calculated is crucial for budgeting and comparing loan offers. This calculator breaks down the total cost of homeownership, not just the principal and interest.
        </p>

        <h3>The Mortgage Payment Formula</h3>
        <p>
          The core of your mortgage payment is the Principal and Interest (P&I). Lenders use a standard amortization formula to ensure your loan is paid off in exactly the specified number of years (e.g., 15, 20, or 30 years).
        </p>
        <p>
          The formula used is:
          <strong>M = P × r(1+r)ⁿ / ((1+r)ⁿ − 1)</strong>
        </p>
        <ul>
          <li><strong>M</strong>: Total monthly payment</li>
          <li><strong>P</strong>: Principal loan amount</li>
          <li><strong>r</strong>: Monthly interest rate (annual rate divided by 12)</li>
          <li><strong>n</strong>: Number of payments (months)</li>
        </ul>
        <p>
          This formula guarantees that in the early years of your loan, most of your payment goes toward interest. In the later years, the balance shifts, and you pay off the principal much faster. This is why making extra payments early on is so powerful.
        </p>

        <h3>Beyond Principal and Interest (PITI)</h3>
        <p>
          A realistic housing budget must account for "PITI" – Principal, Interest, Taxes, and Insurance. Our calculator includes:
        </p>
        <ul>
          <li><strong>Property Taxes:</strong> Usually collected by your local government to fund schools, roads, and services. Lenders often collect this monthly in an escrow account.</li>
          <li><strong>Homeowners Insurance:</strong> Required by lenders to protect the property against hazards like fire or theft.</li>
          <li><strong>HOA Fees:</strong> Homeowners Association dues for condos or planned communities.</li>
        </ul>

        <h3>Understanding Mortgage Insurance (PMI / LMI)</h3>
        <p>
          If your down payment is less than 20% of the home's purchase price, lenders typically require Mortgage Insurance. In the US, this is called Private Mortgage Insurance (PMI), while other regions may call it Lenders Mortgage Insurance (LMI).
        </p>
        <p>
          This insurance protects the <em>lender</em> if you default on the loan, but you pay the premium. It usually costs between 0.3% and 1.5% of the loan amount annually. Once your loan balance drops to 80% of the home's value, this insurance is typically cancelled, lowering your monthly payment.
        </p>

        <h3>The Power of Extra Payments</h3>
        <p>
          Because of the way amortization works, adding even a small amount to your monthly payment can save you tens of thousands in interest and shave years off your loan. Any extra payment goes straight to the principal, reducing the balance that accrues interest the following month. Try entering $100 in the "Extra monthly payment" field to see the dramatic difference it makes.
        </p>
      </div>
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
