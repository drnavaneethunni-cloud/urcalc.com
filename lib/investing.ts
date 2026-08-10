import { clampNum, toCents, ScheduleRow } from "./finance";

export interface CompoundResult {
  totalContributedC: number;
  totalInterestC: number;
  finalBalanceC: number;
  schedule: { year: number; balanceC: number; interestC: number; contributedC: number }[];
}

export function compoundInterest(
  initialBalance: number,
  monthlyContribution: number,
  annualRatePct: number,
  years: number
): CompoundResult {
  const initC = toCents(initialBalance);
  const contribC = toCents(monthlyContribution);
  const r = clampNum(annualRatePct, 0, 50, 0) / 100 / 12;
  const n = clampNum(years, 1, 100, 10) * 12;

  let balanceC = initC;
  let totalContributedC = initC;
  let totalInterestC = 0;
  
  const schedule = [];
  let yearInterest = 0;
  let yearContrib = 0;

  for (let m = 1; m <= n; m++) {
    const interest = Math.round(balanceC * r);
    balanceC += interest + contribC;
    totalInterestC += interest;
    totalContributedC += contribC;

    yearInterest += interest;
    yearContrib += contribC;

    if (m % 12 === 0) {
      schedule.push({
        year: m / 12,
        balanceC,
        interestC: yearInterest,
        contributedC: yearContrib,
      });
      yearInterest = 0;
      yearContrib = 0;
    }
  }

  return { totalContributedC, totalInterestC, finalBalanceC: balanceC, schedule };
}

export interface RoiResult {
  netProfitC: number;
  roiPct: number;
  annualizedRoiPct: number;
}

export function roi(
  amountInvested: number,
  amountReturned: number,
  investmentLengthYears: number
): RoiResult {
  const invC = toCents(amountInvested);
  const retC = toCents(amountReturned);
  const years = clampNum(investmentLengthYears, 0.01, 100, 1);

  if (invC === 0) return { netProfitC: 0, roiPct: 0, annualizedRoiPct: 0 };

  const netProfitC = retC - invC;
  const roiPct = (netProfitC / invC) * 100;
  const annualizedRoiPct = (Math.pow(retC / invC, 1 / years) - 1) * 100;

  return { netProfitC, roiPct, annualizedRoiPct };
}
