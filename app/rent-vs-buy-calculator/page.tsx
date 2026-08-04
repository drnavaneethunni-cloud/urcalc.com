import type { Metadata } from "next";
import Link from "next/link";
import RentVsBuyCalc from "@/components/RentVsBuyCalc";
import { JsonLd, calculatorSchema, breadcrumbSchema, Faq, Disclaimer } from "@/components/seo";

export const metadata: Metadata = {
  title: "Rent vs. Buy Calculator — The Money, and What Matters to You",
  description:
    "See whether renting or buying leaves you ahead financially — full amortization, taxes, and opportunity cost — then weigh it against flexibility, stability, and control with a short preference questionnaire.",
  alternates: { canonical: "/rent-vs-buy-calculator" },
  openGraph: {
    title: "Rent vs. Buy Calculator",
    description:
      "The complete financial comparison, plus a short questionnaire that weighs what money can't capture.",
  },
};

const faqs = [
  {
    q: "Is renting always throwing money away?",
    a: "No. Renting pays for shelter and flexibility, the same way a mortgage payment isn't pure savings either — a large share of it is interest, tax, insurance, and maintenance that builds no wealth. The real comparison is what each side does with the money it isn't spending on housing: a renter who consistently invests the gap between rent and an equivalent mortgage payment can end up ahead of an owner, especially over shorter holding periods.",
  },
  {
    q: "What is the break-even point, and why does it move so much?",
    a: "It's the first year the running math flips — the point where buying's total position (home equity plus invested savings) overtakes renting's, or vice versa. It's sensitive to almost every assumption: a slightly higher appreciation rate, a lower investment return, or a longer holding period can shift it by years, because small annual differences compound. Treat it as a directional signal, not a precise date.",
  },
  {
    q: "Does the mortgage interest deduction still help?",
    a: "Only if your itemized deductions — mortgage interest plus property tax, capped by the SALT limit — exceed the standard deduction. For many owners with a large standard deduction and a capped SALT benefit, itemizing doesn't clear that bar, especially later in a loan when interest paid each year is lower. This calculator checks that comparison every single year and only applies a tax benefit in years it actually wins.",
  },
  {
    q: "Why does the renter start with money already invested?",
    a: "Because a down payment and closing costs are cash a buyer spends immediately and a renter doesn't. That cash has an opportunity cost — if the renter invested it instead, it would grow for the entire holding period. Crediting the renter with that head start is what makes the comparison fair; ignoring it is the single most common mistake in back-of-envelope rent-vs-buy math.",
  },
  {
    q: "What does Stage 2 add that the financial model doesn't?",
    a: "Money is only part of the decision. Stage 2 asks how much four qualitative factors — flexibility, stability, control over your space, and freedom from upkeep — matter to you relative to the dollar gap, and which way each one leans. It's a simplified version of a technique called the Analytic Hierarchy Process, and it produces a combined score that can confirm, narrow, or outright flip the financial verdict, depending on how strongly you weight each factor.",
  },
];

export default function Page() {
  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          "Rent vs. Buy Calculator",
          "Free rent-vs-buy calculator comparing net worth from renting and investing versus buying, plus a preference questionnaire weighing flexibility, stability, control, and upkeep against the dollar gap.",
          "/rent-vs-buy-calculator"
        )}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Rent vs. Buy Calculator", path: "/rent-vs-buy-calculator" }])} />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Rent vs. Buy</div>
        <h1>Rent vs. buy calculator</h1>
        <p className="lede">
          Two questions, answered separately. First, what does the money say — a full financial
          model with amortization, taxes, and opportunity cost? Second, what matters to you —
          flexibility, stability, control, and upkeep, weighed against that dollar gap? Both are
          visible below; neither is the whole answer alone.
        </p>
      </div>

      <RentVsBuyCalc />

      <section className="prose" style={{ marginTop: 12 }}>
        <h2>How this calculator works</h2>
        <p>
          Stage 1 runs a month-by-month simulation over your holding period. Every month, whichever
          household — the buyer or the renter — has the lower housing cost invests the difference at
          your assumed rate of return. The buyer's payment includes principal, interest, property tax
          (which grows with the home's value), homeowners insurance, HOA, and maintenance; the
          renter's includes rent (which grows on its own schedule) and renter's insurance. The renter
          also starts the clock with the buyer's down payment and closing costs already invested,
          since that cash never left their pocket in the first place.
        </p>
        <p>
          At the end of the holding period, the buyer "sells" the home net of selling costs, and
          both sides pay capital gains tax on whatever their invested portfolio grew by — so the
          final comparison, and every year shown in the table along the way, is on the same
          after-tax footing. Along the way, the buyer also gets a mortgage-interest tax benefit in
          any year their itemized deductions (mortgage interest plus property tax, capped at the
          SALT limit) exceed the standard deduction — and no benefit in years they don't, which is
          common later in a loan's life as the interest portion of each payment shrinks.
        </p>
        <p>
          Stage 2 doesn't try to out-argue the math. It takes four things the dollar figure can't
          capture — freedom to move, staying put, making a place yours, and freedom from upkeep —
          and asks two quick questions about each: how much it matters relative to money, and which
          way it leans. Those answers combine into weights (using the same logic behind a technique
          called the Analytic Hierarchy Process) and blend with the financial gap into a single
          buy-or-rent score.
        </p>
        <p>
          The two stages are deliberately kept equal in weight on the page. A calculator that only
          shows the financial answer quietly assumes money is the only thing that matters to you;
          one that only asks about preferences ignores a number that's often tens of thousands of
          dollars. Seeing both, side by side, is the point.
        </p>
      </section>

      <Faq items={faqs} />

      <h2>Related calculators</h2>
      <div className="related">
        <Link href="/mortgage-calculator">Mortgage calculator</Link>
        <Link href="/affordability-calculator">Affordability calculator</Link>
        <Link href="/guides/rent-vs-buy">Rent vs. buy guide</Link>
      </div>

      <Disclaimer />
    </div>
  );
}
