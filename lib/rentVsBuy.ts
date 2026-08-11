/**
 * Rent vs. Buy engine.
 *
 * Stage 1 is a deterministic month-by-month simulation: both households spend
 * the same amount on non-housing living costs, so the only thing that moves
 * net worth is (a) the gap between housing costs, invested by whoever pays
 * less, and (b) what happens to the home itself. The renter is credited with
 * the buyer's down payment + closing costs as an up-front investment — the
 * opportunity cost of not buying. At the end of the holding period the buyer
 * "sells" (net of selling costs) and both portfolios are shown after a
 * capital-gains haircut, so every year in the table is on the same
 * apples-to-apples, after-tax basis.
 *
 * Stage 2 doesn't ask about housing features. It asks about five
 * fundamental life priorities — security, freedom, achievement, financial
 * comfort, and convenience — the same ones that quietly drive most housing
 * decisions anyway, and infers whether each one leans toward renting or
 * buying. Under the hood it's a reduced Analytic Hierarchy Process: instead
 * of the ~10 pairwise judgments a full AHP over money + 5 factors would
 * need, each factor is only compared against money once (how much it
 * matters) plus a direction lean once (which way it points). That's 10
 * judgments instead of 15 — a real trade: no internal consistency check,
 * but a much shorter, much more human questionnaire. See AHP_FACTORS and
 * weightStepToRatio/directionStepToBuyShare below.
 */

import { amortize, clampNum } from "./finance";

// ───────────────────────── Stage 1: the money ─────────────────────────

export interface RentVsBuyInputs {
  homePrice: number;
  downPaymentPct: number;
  mortgageRatePct: number;
  loanTermYears: number;
  monthlyRent: number;
  rentGrowthPct: number;
  yearsStaying: number;
  investmentReturnPct: number;
  // advanced
  propertyTaxPct: number;
  homeInsuranceAnnual: number;
  hoaMonthly: number;
  maintenancePct: number;
  buyingClosingCostsPct: number;
  sellingCostsPct: number;
  appreciationPct: number;
  rentersInsuranceAnnual: number;
  inflationPct: number;
  marginalTaxRatePct: number;
  standardDeduction: number;
  saltCap: number;
  capitalGainsRatePct: number;
  applyTaxBenefit: boolean;
}

export const DEFAULT_RENT_VS_BUY_INPUTS: RentVsBuyInputs = {
  homePrice: 425000,
  downPaymentPct: 20,
  mortgageRatePct: 6.6,
  loanTermYears: 30,
  monthlyRent: 2200,
  rentGrowthPct: 3,
  yearsStaying: 7,
  investmentReturnPct: 7,
  propertyTaxPct: 1.1,
  homeInsuranceAnnual: 1800,
  hoaMonthly: 0,
  maintenancePct: 1,
  buyingClosingCostsPct: 3,
  sellingCostsPct: 7,
  appreciationPct: 3.5,
  rentersInsuranceAnnual: 180,
  inflationPct: 2.8,
  marginalTaxRatePct: 22,
  // Tax year 2026 (IRS Rev. Proc. 2025-32 / One Big Beautiful Bill Act),
  // married-filing-jointly. See /guides/rent-vs-buy for the source note.
  standardDeduction: 32200,
  saltCap: 40400,
  capitalGainsRatePct: 15,
  applyTaxBenefit: true,
};

export interface RentVsBuyYearRow {
  year: number;
  homeValue: number;
  loanBalance: number;
  equityAfterSelling: number;
  netWorthBuying: number;
  netWorthRenting: number;
  diff: number; // netWorthBuying - netWorthRenting
}

export interface RentVsBuyResult {
  rows: RentVsBuyYearRow[];
  breakEvenYear: number | null;
  finalDiff: number;
  headline: "buying" | "renting" | "even";
  downPaymentDollar: number;
  buyingClosingCostsDollar: number;
  monthlyGapAtStart: number; // buyer housing - renter housing, month 1 (positive = buying costs more/mo)
}

export function rentVsBuy(raw: RentVsBuyInputs): RentVsBuyResult {
  const homePrice = clampNum(raw.homePrice, 0, 1e8, 0);
  const downPct = clampNum(raw.downPaymentPct, 0, 100, 20);
  const downPaymentDollar = (homePrice * downPct) / 100;
  const loanAmount = Math.max(0, homePrice - downPaymentDollar);
  const rate = clampNum(raw.mortgageRatePct, 0, 30, 0);
  const termMonths = Math.round(clampNum(raw.loanTermYears, 1, 50, 30) * 12);
  const years = Math.round(clampNum(raw.yearsStaying, 1, 50, 7));
  const horizonMonths = years * 12;
  const investRate = clampNum(raw.investmentReturnPct, -20, 30, 0);
  const appreciationPct = clampNum(raw.appreciationPct, -20, 30, 0);
  const rentGrowthPct = clampNum(raw.rentGrowthPct, -20, 30, 0);
  const inflationPct = clampNum(raw.inflationPct, -10, 30, 0);
  const buyingClosingPct = clampNum(raw.buyingClosingCostsPct, 0, 20, 3);
  const sellingPct = clampNum(raw.sellingCostsPct, 0, 20, 7);
  const propertyTaxPct = clampNum(raw.propertyTaxPct, 0, 10, 1.1);
  const maintenancePct = clampNum(raw.maintenancePct, 0, 10, 1);
  const marginalTaxRatePct = clampNum(raw.marginalTaxRatePct, 0, 50, 22);
  const capGainsPct = clampNum(raw.capitalGainsRatePct, 0, 50, 15);
  const standardDeduction = clampNum(raw.standardDeduction, 0, 1e7, 32200);
  const saltCap = clampNum(raw.saltCap, 0, 1e7, 40400);

  const buyingClosingDollar = (homePrice * buyingClosingPct) / 100;

  const amort = amortize(loanAmount, rate, termMonths);

  let buyerPortfolio = 0;
  let buyerBasis = 0;
  let renterPortfolio = downPaymentDollar + buyingClosingDollar;
  let renterBasis = renterPortfolio;

  let propertyTaxAnnual = (homePrice * propertyTaxPct) / 100;
  let insuranceAnnual = clampNum(raw.homeInsuranceAnnual, 0, 1e6, 1800);
  let hoaMonthly = clampNum(raw.hoaMonthly, 0, 1e5, 0);
  let maintenanceAnnual = (homePrice * maintenancePct) / 100;
  let rentMonthly = clampNum(raw.monthlyRent, 0, 1e6, 2200);
  let rentersInsAnnual = clampNum(raw.rentersInsuranceAnnual, 0, 1e5, 180);

  const monthlyInvestRate = investRate / 100 / 12;

  const rows: RentVsBuyYearRow[] = [];
  let monthlyGapAtStart = 0;
  let month = 0;

  for (let year = 1; year <= years; year++) {
    let yearInterestPaid = 0;

    for (let m = 1; m <= 12 && month < horizonMonths; m++) {
      month++;
      const row = amort.schedule[month - 1];
      const interestC = row ? row.interestC : 0;
      const principalC = row ? row.principalC : 0;
      yearInterestPaid += interestC / 100;

      const piMonthly = (interestC + principalC) / 100;
      const taxMonthly = propertyTaxAnnual / 12;
      const insMonthly = insuranceAnnual / 12;
      const maintMonthly = maintenanceAnnual / 12;
      const buyerHousing = piMonthly + taxMonthly + insMonthly + maintMonthly + hoaMonthly;
      const renterHousing = rentMonthly + rentersInsAnnual / 12;

      if (month === 1) monthlyGapAtStart = buyerHousing - renterHousing;

      buyerPortfolio *= 1 + monthlyInvestRate;
      renterPortfolio *= 1 + monthlyInvestRate;

      const gap = buyerHousing - renterHousing;
      if (gap < 0) {
        buyerPortfolio += -gap;
        buyerBasis += -gap;
      } else if (gap > 0) {
        renterPortfolio += gap;
        renterBasis += gap;
      }
    }

    // Mortgage-interest deduction: only in years where itemizing (mortgage
    // interest + property tax, capped by the SALT cap) beats the standard
    // deduction. The benefit is credited as cash the buyer invests too.
    if (raw.applyTaxBenefit) {
      const itemized = yearInterestPaid + Math.min(propertyTaxAnnual, saltCap);
      if (itemized > standardDeduction) {
        const benefit = ((itemized - standardDeduction) * marginalTaxRatePct) / 100;
        buyerPortfolio += benefit;
        buyerBasis += benefit;
      }
    }

    const homeValueEnd = homePrice * Math.pow(1 + appreciationPct / 100, year);
    const loanBalanceEndC = amort.schedule[Math.min(month, amort.schedule.length) - 1]?.balanceC ?? 0;
    const loanBalanceEnd = month >= amort.schedule.length ? 0 : loanBalanceEndC / 100;
    const sellingCostsDollar = (homeValueEnd * sellingPct) / 100;
    const equityAfterSelling = homeValueEnd - loanBalanceEnd - sellingCostsDollar;

    const buyerGain = Math.max(0, buyerPortfolio - buyerBasis);
    const buyerAfterTax = buyerPortfolio - (buyerGain * capGainsPct) / 100;
    const renterGain = Math.max(0, renterPortfolio - renterBasis);
    const renterAfterTax = renterPortfolio - (renterGain * capGainsPct) / 100;

    const netWorthBuying = equityAfterSelling + buyerAfterTax;
    const netWorthRenting = renterAfterTax;

    rows.push({
      year,
      homeValue: homeValueEnd,
      loanBalance: loanBalanceEnd,
      equityAfterSelling,
      netWorthBuying,
      netWorthRenting,
      diff: netWorthBuying - netWorthRenting,
    });

    // Grow next year's annually-updated figures.
    propertyTaxAnnual = (homeValueEnd * propertyTaxPct) / 100;
    maintenanceAnnual = (homeValueEnd * maintenancePct) / 100;
    insuranceAnnual *= 1 + inflationPct / 100;
    hoaMonthly *= 1 + inflationPct / 100;
    rentersInsAnnual *= 1 + inflationPct / 100;
    rentMonthly *= 1 + rentGrowthPct / 100;
  }

  let breakEvenYear: number | null = null;
  if (rows.length > 0) {
    const initialSign = Math.sign(rows[0].diff);
    for (let i = 0; i < rows.length; i++) {
      const s = Math.sign(rows[i].diff);
      if (s === 0 || (i > 0 && s !== initialSign)) {
        breakEvenYear = rows[i].year;
        break;
      }
    }
  }

  const finalRow = rows[rows.length - 1];
  const finalDiff = finalRow ? finalRow.diff : 0;
  const threshold = homePrice * 0.01;
  const headline: "buying" | "renting" | "even" =
    Math.abs(finalDiff) < threshold ? "even" : finalDiff > 0 ? "buying" : "renting";

  return {
    rows,
    breakEvenYear,
    finalDiff,
    headline,
    downPaymentDollar,
    buyingClosingCostsDollar: buyingClosingDollar,
    monthlyGapAtStart,
  };
}

// ─────────────── Stage 2: five life priorities, weighed AHP-style ───────────────
// The user never sees the words "feature," "attribute," or "AHP" — they answer
// five simple questions about what matters to them in life. Renting and buying
// are just what each answer quietly points toward.

export interface AhpFactorDef {
  key: "security" | "freedom" | "achievement" | "financialComfort" | "convenience";
  label: string;
  question: string;
  examples: string[];
  directionStep: number;
}

export const AHP_FACTORS: AhpFactorDef[] = [
  {
    key: "security",
    label: "Security",
    question: "How important is feeling secure about where you live?",
    examples: ["Stable home", "Children's schooling", "Long-term roots", "Family security", "Peace of mind"],
    directionStep: 7,
  },
  {
    key: "freedom",
    label: "Freedom",
    question: "How important is having the freedom to change your plans in life?",
    examples: ["Career opportunities", "Relocating", "Business", "Travel", "Flexibility"],
    directionStep: -7,
  },
  {
    key: "achievement",
    label: "Achievement",
    question: "How important is owning a home as a personal life goal?",
    examples: ["Pride", "Sense of accomplishment", "Building something of your own", "Personal milestone", "Identity"],
    directionStep: 7,
  },
  {
    key: "financialComfort",
    label: "Financial Predictability",
    question: "How important is having a fixed, predictable housing payment over the long term?",
    examples: ["Protection from rent hikes", "Long-term planning", "Fixed-rate mortgage stability", "No surprises"],
    directionStep: 7,
  },
  {
    key: "convenience",
    label: "Convenience",
    question: "How important is having fewer day-to-day responsibilities and unexpected costs?",
    examples: ["No maintenance", "No surprise repairs", "Landlord handles issues", "Time commitment", "Simplicity"],
    directionStep: -7,
  },
];

export const WEIGHT_STEP_MIN = -7;
export const WEIGHT_STEP_MAX = 7;
/** Sensible non-zero defaults: money still matters, but each factor has a
 *  real (moderate) say from the moment the page loads. */
export const DEFAULT_WEIGHT_STEP = -2;

/** AHP-style ratio for a weight-vs-money step: magnitude = |step|+1, ratio =
 *  magnitude when the factor outweighs money, 1/magnitude when money wins.
 *  The 15-position step range gives the underlying math fine resolution even
 *  though the wording shown to the user (below) collapses it to three plain
 *  buckets — precision under the hood, simplicity on the screen. */
export function weightStepToRatio(step: number): number {
  const magnitude = Math.abs(step) + 1;
  return step > 0 ? magnitude : 1 / magnitude;
}

/** Plain-English bucket for how far a step sits from "equal," used by both
 *  the weight and direction wording below. */
function magnitudeBucket(step: number): "a little" | "more" | "a lot" {
  const abs = Math.abs(step);
  if (abs <= 2) return "a little";
  if (abs <= 5) return "more";
  return "a lot";
}

export function weightStepWording(step: number): string {
  if (step === 0) return "Equally important as money";
  const bucket = magnitudeBucket(step);
  if (step > 0) {
    return bucket === "a little" ? "A little more important than money" : bucket === "more" ? "More important than money" : "Much more important than money";
  }
  return bucket === "a little" ? "Money matters a little more" : bucket === "more" ? "Money matters more" : "Money matters much more";
}

/** 0..1 "buy share" for a direction step: 0.5 = neutral, scaling to 0/1 at the extremes. */
export function directionStepToBuyShare(step: number): number {
  return clampNum(0.5 + step / (2 * WEIGHT_STEP_MAX), 0, 1, 0.5);
}

export interface AhpFactorState {
  key: AhpFactorDef["key"];
  weightStep: number;
}

export interface AhpWeightEntry {
  key: string;
  label: string;
  weight: number; // normalized, sums to 1 across money + factors
}

export interface AhpResult {
  weights: AhpWeightEntry[]; // [money, ...factors], normalized
  buyScore: number; // 0..1
  rentScore: number; // 0..1
  topFactor: AhpWeightEntry | null; // highest-weighted non-money factor
  state: "flip" | "close" | "confirm";
}

/** How much of the Stage-1 dollar gap converts to a "buy share" for money.
 *  tanh keeps a single huge dollar gap from fully dominating the blend;
 *  20% of home price maps to a strong (but not absolute) lean. */
export function moneyBuyShare(finalDiff: number, homePrice: number): number {
  const scale = Math.max(1, homePrice * 0.2);
  return 0.5 + 0.5 * Math.tanh(finalDiff / scale);
}

export function computeAhp(
  factorStates: AhpFactorState[],
  finalDiff: number,
  homePrice: number,
  moneyHeadline: "buying" | "renting" | "even"
): AhpResult {
  const moneyRatio = 1;
  const factorRatios = factorStates.map((f) => weightStepToRatio(f.weightStep));
  const total = moneyRatio + factorRatios.reduce((s, r) => s + r, 0);

  const moneyWeight = moneyRatio / total;
  const factorWeights = factorRatios.map((r) => r / total);

  const moneyShare = moneyBuyShare(finalDiff, homePrice);
  const factorShares = factorStates.map((f) => {
    const def = AHP_FACTORS.find((d) => d.key === f.key);
    return directionStepToBuyShare(def ? def.directionStep : 0);
  });

  const buyScore = moneyWeight * moneyShare + factorWeights.reduce((s, w, i) => s + w * factorShares[i], 0);
  const rentScore = 1 - buyScore;

  const weights: AhpWeightEntry[] = [
    { key: "money", label: "What the money says", weight: moneyWeight },
    ...factorStates.map((f, i) => ({
      key: f.key,
      label: AHP_FACTORS.find((d) => d.key === f.key)?.label ?? f.key,
      weight: factorWeights[i],
    })),
  ];

  const topFactor = weights
    .filter((w) => w.key !== "money")
    .reduce<AhpWeightEntry | null>((best, w) => (!best || w.weight > best.weight ? w : best), null);

  const pointsFrom50 = Math.abs(buyScore * 100 - 50);
  const combinedVerdict: "buying" | "renting" | "even" = buyScore > 0.5 ? "buying" : buyScore < 0.5 ? "renting" : "even";

  let state: AhpResult["state"];
  if (pointsFrom50 <= 12) {
    state = "close";
  } else if (moneyHeadline !== "even" && combinedVerdict !== moneyHeadline) {
    state = "flip";
  } else {
    state = "confirm";
  }

  return { weights, buyScore, rentScore, topFactor, state };
}
