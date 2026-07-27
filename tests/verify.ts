import { amortize, mortgage, autoLoan, personalLoan, affordability, monthlyPaymentC } from "../lib/finance";

let pass = 0, fail = 0;
function eq(name: string, got: number, want: number, tol = 1) {
  if (Math.abs(got - want) <= tol) { pass++; }
  else { fail++; console.log(`FAIL ${name}: got ${got}, want ${want}`); }
}

// 1. Known value: $300,000 @ 6.5%, 30yr → $1,896.20/mo
eq("300k@6.5/30 payment", monthlyPaymentC(30000000, 6.5, 360), 189620, 2);

// 2. Known value: $200,000 @ 5%, 15yr → $1,581.59/mo
eq("200k@5/15 payment", monthlyPaymentC(20000000, 5, 180), 158159, 2);

// 3. Zero-interest edge: $12,000 @ 0%, 12mo → exactly $1,000/mo, zero interest
const z = amortize(12000, 0, 12);
eq("0% payment", z.paymentC, 100000, 0);
eq("0% total interest", z.totalInterestC, 0, 0);
eq("0% payoff months", z.payoffMonths, 12, 0);

// 4. Balance lands on exactly zero
const a = amortize(300000, 6.5, 360);
eq("final balance zero", a.schedule[a.schedule.length - 1].balanceC, 0, 0);
eq("term months", a.payoffMonths, 360, 0);

// 5. Total principal in schedule equals loan amount exactly
const sumPrin = a.schedule.reduce((s, r) => s + r.principalC, 0);
eq("principal conservation", sumPrin, 30000000, 0);

// 6. Extra payment shortens term and saves interest
const e = amortize(300000, 6.5, 360, 200);
eq("extra shortens term", e.payoffMonths < 360 ? 1 : 0, 1, 0);
eq("extra saves interest", a.totalInterestC - e.totalInterestC > 5000000 ? 1 : 0, 1, 0);

// 7. Extra >= balance month 1: immediate payoff, no infinite loop
const imm = amortize(1000, 6.5, 360, 100000);
eq("immediate payoff", imm.payoffMonths, 1, 0);

// 8. Mortgage PMI: 10% down → PMI applied, then drops; 20% down → no PMI
const m1 = mortgage({ homePrice: 400000, downPayment: 40000, annualRatePct: 6.5, termYears: 30, propertyTaxAnnual: 4800, insuranceAnnual: 1600, hoaMonthly: 0, pmiRatePct: 0.6, extraMonthly: 0 });
eq("PMI applied", m1.pmiMonthlyC, 18000, 0); // 360000 * 0.6% / 12 = $180
eq("PMI drops eventually", m1.pmiDropMonth > 0 && m1.pmiDropMonth < 360 ? 1 : 0, 1, 0);
const m2 = mortgage({ ...({ homePrice: 400000, downPayment: 80000, annualRatePct: 6.5, termYears: 30, propertyTaxAnnual: 0, insuranceAnnual: 0, hoaMonthly: 0, pmiRatePct: 0.6, extraMonthly: 0 }) });
eq("no PMI at 20% down", m2.pmiMonthlyC, 0, 0);
// escrow math: tax 4800/yr = $400/mo, ins 1600/yr = $133.33/mo
eq("tax monthly", m1.taxMonthlyC, 40000, 0);
eq("all-in = P&I+tax+ins+PMI", m1.allInMonthlyC, m1.paymentC + 40000 + 13333 + 18000, 1);

// 9. Auto loan: negative equity rolls in, tax after trade-in
const au = autoLoan({ vehiclePrice: 30000, downPayment: 3000, tradeInValue: 8000, amountOwedOnTradeIn: 10000, salesTaxPct: 6, fees: 500, annualRatePct: 7, termMonths: 60, taxAfterTradeIn: true });
// tax base = 30000-8000=22000 → tax $1,320; financed = 30000+500-3000-(8000-10000)+1320 = 30820
eq("auto tax", au.taxC, 132000, 0);
eq("auto financed", au.financedC, 3082000, 0);

// 10. Auto: tax on full price (CA-style)
const au2 = autoLoan({ vehiclePrice: 30000, downPayment: 0, tradeInValue: 8000, amountOwedOnTradeIn: 0, salesTaxPct: 6, fees: 0, annualRatePct: 7, termMonths: 60, taxAfterTradeIn: false });
eq("auto tax full price", au2.taxC, 180000, 0);

// 11. Personal loan: origination fee raises effective APR above nominal
const p = personalLoan({ amount: 10000, annualRatePct: 10, termMonths: 36, originationFeePct: 5, extraMonthly: 0 });
eq("fee cents", p.feeC, 50000, 0);
eq("disbursed", p.disbursedC, 950000, 0);
eq("effective APR > nominal", p.effectiveAprPct > 10 ? 1 : 0, 1, 0);
eq("effective APR sane", p.effectiveAprPct < 20 ? 1 : 0, 1, 0);

// 12. Garbage inputs: NaN, negative → no crash, safe zeros
const g = amortize(NaN as unknown as number, -5, -10);
eq("NaN principal safe", g.paymentC, 0, 0);
const g2 = mortgage({ homePrice: -100, downPayment: 99999, annualRatePct: NaN as unknown as number, termYears: 0, propertyTaxAnnual: -1, insuranceAnnual: NaN as unknown as number, hoaMonthly: -5, pmiRatePct: 99, extraMonthly: -3 });
eq("garbage mortgage safe", Number.isFinite(g2.allInMonthlyC) ? 1 : 0, 1, 0);

// 13. Payment-below-interest guard terminates
const t = amortize(1000000, 30, 1200);
eq("extreme loan terminates", t.payoffMonths <= 1200 ? 1 : 0, 1, 0);

// 14. Affordability: known scenario — $100k/yr income, no other debts, 20% down, 6.5%/30yr,
// 1.1% tax, 0.4% insurance, no HOA. Front-end (28%) should bind since back-end room is larger.
const aff1 = affordability({
  annualIncome: 100000, monthlyDebts: 0, downPayment: 80000, annualRatePct: 6.5, termYears: 30,
  propertyTaxPctAnnual: 1.1, insurancePctAnnual: 0.4, hoaMonthly: 0, pmiRatePct: 0.6,
  frontEndRatioPct: 28, backEndRatioPct: 36,
});
eq("affordability front-end binds", aff1.bindingConstraint === "front-end" ? 1 : 0, 1, 0);
eq("affordability front-end DTI near 28%", aff1.frontEndDTIPct, 28, 0.5);
eq("affordability no PMI at 20%+ implied down", aff1.pmiMonthlyC, 0, 0);
eq("affordability home price positive", aff1.maxHomePriceC > 0 ? 1 : 0, 1, 0);

// 15. Affordability: heavy existing debt should force back-end to bind instead.
const aff2 = affordability({
  annualIncome: 100000, monthlyDebts: 1500, downPayment: 80000, annualRatePct: 6.5, termYears: 30,
  propertyTaxPctAnnual: 1.1, insurancePctAnnual: 0.4, hoaMonthly: 0, pmiRatePct: 0.6,
  frontEndRatioPct: 28, backEndRatioPct: 36,
});
eq("affordability back-end binds with heavy debt", aff2.bindingConstraint === "back-end" ? 1 : 0, 1, 0);
eq("affordability lower price with more debt", aff2.maxHomePriceC < aff1.maxHomePriceC ? 1 : 0, 1, 0);

// 16. Affordability: zero income is safe, not NaN/crash.
const aff3 = affordability({
  annualIncome: 0, monthlyDebts: 0, downPayment: 0, annualRatePct: 6.5, termYears: 30,
  propertyTaxPctAnnual: 1.1, insurancePctAnnual: 0.4, hoaMonthly: 0, pmiRatePct: 0.6,
  frontEndRatioPct: 28, backEndRatioPct: 36,
});
eq("affordability zero income safe", Number.isFinite(aff3.maxHomePriceC) ? 1 : 0, 1, 0);
eq("affordability zero income zero price", aff3.maxHomePriceC, 0, 100);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
