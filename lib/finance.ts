/**
 * Core loan mathematics engine.
 *
 * All money is computed in integer CENTS to eliminate floating-point drift.
 * Edge cases handled:
 *  - 0% interest (payment = principal / months)
 *  - Final payment adjusted so the balance lands on exactly $0.00
 *  - Extra monthly payments (shortens term; last payment capped at remaining balance)
 *  - Extra payment >= balance in month 1 (immediate payoff)
 *  - PMI auto-drop when loan-to-value reaches 80% of original home value
 *  - Zero/negative/NaN inputs clamped to safe values
 *  - Runaway schedules capped at 100 years as a hard guard
 */

export interface ScheduleRow {
  month: number;
  interestC: number;
  principalC: number;
  extraC: number;
  balanceC: number;
}

export interface AmortResult {
  /** Base monthly principal+interest payment, in cents */
  paymentC: number;
  /** Total interest paid over the life of the loan, in cents */
  totalInterestC: number;
  /** Total of all payments (principal + interest), in cents */
  totalPaidC: number;
  /** Actual number of months until payoff (may be < term with extra payments) */
  payoffMonths: number;
  schedule: ScheduleRow[];
}

const MAX_MONTHS = 1200; // 100-year hard guard

export function clampNum(v: number, min: number, max: number, fallback = min): number {
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

export function toCents(dollars: number): number {
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  return Math.round(dollars * 100);
}

/** Base monthly P&I payment in cents. Handles r = 0. */
export function monthlyPaymentC(principalC: number, annualRatePct: number, months: number): number {
  if (principalC <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return Math.ceil(principalC / months);
  const pow = Math.pow(1 + r, months);
  // Round UP: lenders set the payment at the next cent so the loan never
  // runs past its term; the final payment is adjusted down instead.
  return Math.ceil((principalC * r * pow) / (pow - 1));
}

export function amortize(
  principal: number,
  annualRatePct: number,
  months: number,
  extraMonthly = 0
): AmortResult {
  const principalC = toCents(principal);
  const n = Math.floor(clampNum(months, 1, MAX_MONTHS, 360));
  const rate = clampNum(annualRatePct, 0, 30, 0);
  const extraC = toCents(clampNum(extraMonthly, 0, 1e9, 0));
  const r = rate / 100 / 12;

  const paymentC = monthlyPaymentC(principalC, rate, n);
  const schedule: ScheduleRow[] = [];

  let balanceC = principalC;
  let totalInterestC = 0;
  let month = 0;

  while (balanceC > 0 && month < MAX_MONTHS) {
    month++;
    const interestC = Math.round(balanceC * r);
    let due = paymentC + extraC;

    // Final payment: never overpay past a zero balance.
    if (due >= balanceC + interestC) {
      due = balanceC + interestC;
    }

    // Guard: if payment doesn't cover interest (extreme rate/term combos),
    // force at least $1 of principal so the loop always terminates.
    let principalPaidC = due - interestC;
    if (principalPaidC <= 0) principalPaidC = Math.min(100, balanceC);

    balanceC -= principalPaidC;
    totalInterestC += interestC;

    schedule.push({
      month,
      interestC,
      principalC: principalPaidC,
      extraC: Math.max(0, principalPaidC - Math.max(0, paymentC - interestC)),
      balanceC,
    });
  }

  return {
    paymentC,
    totalInterestC,
    totalPaidC: principalC + totalInterestC,
    payoffMonths: month,
    schedule,
  };
}

export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  annualRatePct: number;
  termYears: number;
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  /** Annual PMI rate as % of loan amount; applied while LTV > 80% */
  pmiRatePct: number;
  extraMonthly: number;
}

export interface MortgageResult extends AmortResult {
  loanC: number;
  taxMonthlyC: number;
  insuranceMonthlyC: number;
  hoaMonthlyC: number;
  pmiMonthlyC: number;
  /** Month index (1-based) when PMI drops off; 0 = never applied */
  pmiDropMonth: number;
  totalPmiC: number;
  /** Full first-month housing payment: P&I + tax + ins + HOA + PMI */
  allInMonthlyC: number;
}

export function mortgage(inp: MortgageInputs): MortgageResult {
  const price = clampNum(inp.homePrice, 0, 1e9, 0);
  const down = clampNum(inp.downPayment, 0, price, 0);
  const loan = price - down;
  const base = amortize(loan, inp.annualRatePct, Math.round(clampNum(inp.termYears, 1, 50, 30) * 12), inp.extraMonthly);

  const priceC = toCents(price);
  const taxMonthlyC = Math.round(toCents(clampNum(inp.propertyTaxAnnual, 0, 1e8, 0)) / 12);
  const insuranceMonthlyC = Math.round(toCents(clampNum(inp.insuranceAnnual, 0, 1e8, 0)) / 12);
  const hoaMonthlyC = toCents(clampNum(inp.hoaMonthly, 0, 1e7, 0));

  // PMI: applies while balance / home value > 80%, on conventional loans with <20% down.
  const pmiRate = clampNum(inp.pmiRatePct, 0, 5, 0);
  const loanC = toCents(loan);
  const pmiMonthlyC = pmiRate > 0 && down / (price || 1) < 0.2 ? Math.round((loanC * (pmiRate / 100)) / 12) : 0;

  let pmiDropMonth = 0;
  let totalPmiC = 0;
  if (pmiMonthlyC > 0 && priceC > 0) {
    const thresholdC = Math.round(priceC * 0.8);
    for (const row of base.schedule) {
      if (row.balanceC > thresholdC) {
        totalPmiC += pmiMonthlyC;
        pmiDropMonth = row.month + 1;
      } else break;
    }
    if (pmiDropMonth > base.payoffMonths) pmiDropMonth = base.payoffMonths;
  }

  return {
    ...base,
    loanC,
    taxMonthlyC,
    insuranceMonthlyC,
    hoaMonthlyC,
    pmiMonthlyC,
    pmiDropMonth,
    totalPmiC,
    allInMonthlyC: base.paymentC + taxMonthlyC + insuranceMonthlyC + hoaMonthlyC + pmiMonthlyC,
  };
}

export interface AutoLoanInputs {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  amountOwedOnTradeIn: number;
  salesTaxPct: number;
  fees: number;
  annualRatePct: number;
  termMonths: number;
  /** Most states tax the price after trade-in credit; a few tax the full price. */
  taxAfterTradeIn: boolean;
}

export interface AutoLoanResult extends AmortResult {
  taxC: number;
  financedC: number;
}

export function autoLoan(inp: AutoLoanInputs): AutoLoanResult {
  const price = clampNum(inp.vehiclePrice, 0, 1e7, 0);
  const down = clampNum(inp.downPayment, 0, 1e7, 0);
  const trade = clampNum(inp.tradeInValue, 0, 1e7, 0);
  const owed = clampNum(inp.amountOwedOnTradeIn, 0, 1e7, 0);
  const fees = clampNum(inp.fees, 0, 1e6, 0);
  const taxPct = clampNum(inp.salesTaxPct, 0, 15, 0);

  const taxBase = inp.taxAfterTradeIn ? Math.max(0, price - trade) : price;
  const taxC = Math.round(toCents(taxBase) * (taxPct / 100));

  // Negative equity on the trade-in rolls into the loan.
  const netTrade = trade - owed;
  const financed = Math.max(0, price + fees - down - netTrade) + taxC / 100;
  const financedC = toCents(financed);

  const base = amortize(financedC / 100, inp.annualRatePct, Math.floor(clampNum(inp.termMonths, 1, 120, 60)));
  return { ...base, taxC, financedC };
}

export interface PersonalLoanInputs {
  amount: number;
  annualRatePct: number;
  termMonths: number;
  /** Origination fee as % of amount, deducted from disbursement */
  originationFeePct: number;
  extraMonthly: number;
}

export interface PersonalLoanResult extends AmortResult {
  feeC: number;
  /** Cash actually received after the origination fee */
  disbursedC: number;
  /** Effective APR including the origination fee */
  effectiveAprPct: number;
}
export function personalLoan(inp: PersonalLoanInputs): PersonalLoanResult {
  const amount = clampNum(inp.amount, 0, 1e7, 0);
  const feePct = clampNum(inp.originationFeePct, 0, 12, 0);
  const amountC = toCents(amount);
  const feeC = Math.round(amountC * (feePct / 100));
  const n = Math.floor(clampNum(inp.termMonths, 1, 240, 36));

  const base = amortize(amount, inp.annualRatePct, n, inp.extraMonthly);

  // Effective APR: solve the rate at which paying `paymentC` for n months
  // has present value equal to the DISBURSED amount (amount - fee).
  const disbursedC = amountC - feeC;
  let effectiveAprPct = clampNum(inp.annualRatePct, 0, 30, 0);
  if (feeC > 0 && disbursedC > 0 && base.paymentC > 0) {
    let lo = 0;
    let hi = 1; // 100%/yr monthly-rate upper bound (hi = 1/12 monthly would be 100% APR; use generous bound)
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      const r = mid / 12;
      const pv =
        r === 0 ? base.paymentC * n : (base.paymentC * (1 - Math.pow(1 + r, -n))) / r;
      if (pv > disbursedC) lo = mid;
      else hi = mid;
    }
    effectiveAprPct = ((lo + hi) / 2) * 100;
  }

  return { ...base, feeC, disbursedC, effectiveAprPct };
}

export interface AffordabilityInputs {
  annualIncome: number;
  /** Existing monthly debt payments: car loans, student loans, credit cards, etc. */
  monthlyDebts: number;
  downPayment: number;
  annualRatePct: number;
  termYears: number;
  /** Property tax as % of home price per year */
  propertyTaxPctAnnual: number;
  /** Home insurance as % of home price per year */
  insurancePctAnnual: number;
  hoaMonthly: number;
  /** Annual PMI rate as % of loan amount; applied while down payment < 20% */
  pmiRatePct: number;
  /** Front-end DTI ceiling: housing payment as % of gross monthly income (default 28) */
  frontEndRatioPct: number;
  /** Back-end DTI ceiling: housing payment + other debts as % of gross monthly income (default 36) */
  backEndRatioPct: number;
}

export interface AffordabilityResult {
  maxHomePriceC: number;
  maxLoanC: number;
  /** The lower of the front-end and back-end derived payment caps — the binding constraint */
  maxMonthlyPaymentC: number;
  bindingConstraint: "front-end" | "back-end";
  piC: number;
  taxMonthlyC: number;
  insuranceMonthlyC: number;
  hoaMonthlyC: number;
  pmiMonthlyC: number;
  /** Resulting front-end ratio (housing / gross income) at the max home price, as % */
  frontEndDTIPct: number;
  /** Resulting back-end ratio (housing + debts / gross income) at the max home price, as % */
  backEndDTIPct: number;
}

export function affordability(inp: AffordabilityInputs): AffordabilityResult {
  const monthlyIncome = clampNum(inp.annualIncome, 0, 1e10, 0) / 12;
  const frontRatio = clampNum(inp.frontEndRatioPct, 1, 100, 28) / 100;
  const backRatio = clampNum(inp.backEndRatioPct, 1, 100, 36) / 100;
  const debts = clampNum(inp.monthlyDebts, 0, 1e8, 0);

  const frontCap = monthlyIncome * frontRatio;
  const backCap = monthlyIncome * backRatio - debts;
  const maxPayment = Math.max(0, Math.min(frontCap, backCap));
  const maxPaymentC = toCents(maxPayment);
  const binding: "front-end" | "back-end" = frontCap <= backCap ? "front-end" : "back-end";

  const down = clampNum(inp.downPayment, 0, 1e10, 0);
  const rate = clampNum(inp.annualRatePct, 0, 30, 0);
  const months = Math.round(clampNum(inp.termYears, 1, 50, 30) * 12);
  const taxPct = clampNum(inp.propertyTaxPctAnnual, 0, 10, 0) / 100;
  const insPct = clampNum(inp.insurancePctAnnual, 0, 10, 0) / 100;
  const hoaC = toCents(clampNum(inp.hoaMonthly, 0, 1e7, 0));
  const pmiPct = clampNum(inp.pmiRatePct, 0, 5, 0) / 100;

  function breakdownAt(homePrice: number) {
    const homePriceC = toCents(homePrice);
    const loanC = toCents(Math.max(0, homePrice - down));
    const piC = monthlyPaymentC(loanC, rate, months);
    const taxC = Math.round((homePriceC * taxPct) / 12);
    const insC = Math.round((homePriceC * insPct) / 12);
    const ltv = homePrice > 0 ? down / homePrice : 1;
    const pmiC = pmiPct > 0 && ltv < 0.2 ? Math.round((loanC * pmiPct) / 12) : 0;
    return { loanC, piC, taxC, insC, pmiC, totalC: piC + taxC + insC + hoaC + pmiC };
  }

  // Binary search the highest home price whose total monthly cost stays within the cap.
  let lo = down;
  let hi = down + 1e8;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (breakdownAt(mid).totalC <= maxPaymentC) lo = mid;
    else hi = mid;
  }
  const homePrice = lo;
  const b = breakdownAt(homePrice);

  const frontEndDTIPct = monthlyIncome > 0 ? (b.totalC / 100 / monthlyIncome) * 100 : 0;
  const backEndDTIPct = monthlyIncome > 0 ? ((b.totalC / 100 + debts) / monthlyIncome) * 100 : 0;

  return {
    maxHomePriceC: toCents(homePrice),
    maxLoanC: b.loanC,
    maxMonthlyPaymentC: maxPaymentC,
    bindingConstraint: binding,
    piC: b.piC,
    taxMonthlyC: b.taxC,
    insuranceMonthlyC: b.insC,
    hoaMonthlyC: hoaC,
    pmiMonthlyC: b.pmiC,
    frontEndDTIPct,
    backEndDTIPct,
  };
}
