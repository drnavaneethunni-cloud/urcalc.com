"use client";

import { useEffect, useMemo, useState } from "react";
import {
  rentVsBuy,
  computeAhp,
  DEFAULT_RENT_VS_BUY_INPUTS,
  AHP_FACTORS,
  WEIGHT_STEP_MIN,
  WEIGHT_STEP_MAX,
  DEFAULT_WEIGHT_STEP,
  DEFAULT_DIRECTION_STEP,
  weightStepWording,
  directionStepWording,
  type RentVsBuyInputs,
  type AhpFactorState,
} from "@/lib/rentVsBuy";
import { fmtC, fmtPct } from "@/lib/format";
import {
  NumField,
  ToggleGroup,
  DualDownPaymentField,
  StatementRow,
  CompositionBar,
  ShareButtons,
  DiscreteSlider,
} from "@/components/ui";

export interface RentVsBuyPreset {
  homePrice?: number;
  monthlyRent?: number;
}

function readParam(sp: URLSearchParams, key: string, fallback: number): number {
  const v = Number(sp.get(key));
  return Number.isFinite(v) && sp.has(key) ? v : fallback;
}

function initialFactors(): AhpFactorState[] {
  return AHP_FACTORS.map((f) => ({
    key: f.key,
    weightStep: DEFAULT_WEIGHT_STEP,
    directionStep: DEFAULT_DIRECTION_STEP,
  }));
}

export default function RentVsBuyCalc({ preset }: { preset?: RentVsBuyPreset }) {
  const d = DEFAULT_RENT_VS_BUY_INPUTS;
  const [homePrice, setHomePrice] = useState(preset?.homePrice ?? d.homePrice);
  const [downPaymentPct, setDownPaymentPct] = useState(d.downPaymentPct);
  const [mortgageRatePct, setMortgageRatePct] = useState(d.mortgageRatePct);
  const [loanTermYears, setLoanTermYears] = useState(d.loanTermYears);
  const [monthlyRent, setMonthlyRent] = useState(preset?.monthlyRent ?? d.monthlyRent);
  const [rentGrowthPct, setRentGrowthPct] = useState(d.rentGrowthPct);
  const [yearsStaying, setYearsStaying] = useState(d.yearsStaying);
  const [investmentReturnPct, setInvestmentReturnPct] = useState(d.investmentReturnPct);

  const [propertyTaxPct, setPropertyTaxPct] = useState(d.propertyTaxPct);
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState(d.homeInsuranceAnnual);
  const [hoaMonthly, setHoaMonthly] = useState(d.hoaMonthly);
  const [maintenancePct, setMaintenancePct] = useState(d.maintenancePct);
  const [buyingClosingCostsPct, setBuyingClosingCostsPct] = useState(d.buyingClosingCostsPct);
  const [sellingCostsPct, setSellingCostsPct] = useState(d.sellingCostsPct);
  const [appreciationPct, setAppreciationPct] = useState(d.appreciationPct);
  const [rentersInsuranceAnnual, setRentersInsuranceAnnual] = useState(d.rentersInsuranceAnnual);
  const [inflationPct, setInflationPct] = useState(d.inflationPct);
  const [marginalTaxRatePct, setMarginalTaxRatePct] = useState(d.marginalTaxRatePct);
  const [standardDeduction, setStandardDeduction] = useState(d.standardDeduction);
  const [saltCap, setSaltCap] = useState(d.saltCap);
  const [capitalGainsRatePct, setCapitalGainsRatePct] = useState(d.capitalGainsRatePct);
  const [applyTaxBenefit, setApplyTaxBenefit] = useState(d.applyTaxBenefit);

  const [factors, setFactors] = useState<AhpFactorState[]>(initialFactors());
  const [hasInteracted, setHasInteracted] = useState(false);

  // Hydrate from a shareable URL once on mount.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if ([...sp.keys()].length === 0) return;
    setHomePrice(readParam(sp, "hp", preset?.homePrice ?? d.homePrice));
    setDownPaymentPct(readParam(sp, "dpp", d.downPaymentPct));
    setMortgageRatePct(readParam(sp, "r", d.mortgageRatePct));
    setLoanTermYears(readParam(sp, "t", d.loanTermYears));
    setMonthlyRent(readParam(sp, "rent", preset?.monthlyRent ?? d.monthlyRent));
    setRentGrowthPct(readParam(sp, "rg", d.rentGrowthPct));
    setYearsStaying(readParam(sp, "yrs", d.yearsStaying));
    setInvestmentReturnPct(readParam(sp, "ir", d.investmentReturnPct));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputs: RentVsBuyInputs = useMemo(
    () => ({
      homePrice,
      downPaymentPct,
      mortgageRatePct,
      loanTermYears,
      monthlyRent,
      rentGrowthPct,
      yearsStaying,
      investmentReturnPct,
      propertyTaxPct,
      homeInsuranceAnnual,
      hoaMonthly,
      maintenancePct,
      buyingClosingCostsPct,
      sellingCostsPct,
      appreciationPct,
      rentersInsuranceAnnual,
      inflationPct,
      marginalTaxRatePct,
      standardDeduction,
      saltCap,
      capitalGainsRatePct,
      applyTaxBenefit,
    }),
    [
      homePrice, downPaymentPct, mortgageRatePct, loanTermYears, monthlyRent, rentGrowthPct,
      yearsStaying, investmentReturnPct, propertyTaxPct, homeInsuranceAnnual, hoaMonthly,
      maintenancePct, buyingClosingCostsPct, sellingCostsPct, appreciationPct,
      rentersInsuranceAnnual, inflationPct, marginalTaxRatePct, standardDeduction, saltCap,
      capitalGainsRatePct, applyTaxBenefit,
    ]
  );

  const res = useMemo(() => rentVsBuy(inputs), [inputs]);
  const ahp = useMemo(
    () => computeAhp(factors, res.finalDiff, homePrice, res.headline),
    [factors, res.finalDiff, homePrice, res.headline]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams({
      hp: String(homePrice), dpp: String(downPaymentPct), r: String(mortgageRatePct),
      t: String(loanTermYears), rent: String(monthlyRent), rg: String(rentGrowthPct),
      yrs: String(yearsStaying), ir: String(investmentReturnPct),
    });
    return `${window.location.origin}${window.location.pathname}?${sp}`;
  }, [homePrice, downPaymentPct, mortgageRatePct, loanTermYears, monthlyRent, rentGrowthPct, yearsStaying, investmentReturnPct]);

  function updateFactor(key: string, field: "weightStep" | "directionStep", value: number) {
    setHasInteracted(true);
    setFactors((prev) => prev.map((f) => (f.key === key ? { ...f, [field]: value } : f)));
  }

  const finalRow = res.rows[res.rows.length - 1];
  const headlineText =
    res.headline === "even"
      ? `About even after ${yearsStaying} years — the gap is under 1% of the home price.`
      : res.headline === "buying"
      ? `Buying leaves you ${fmtC(res.finalDiff * 100)} ahead after ${yearsStaying} years.`
      : `Renting leaves you ${fmtC(-res.finalDiff * 100)} ahead after ${yearsStaying} years.`;

  return (
    <>
      {hasInteracted ? <SummaryStrip res={res} ahp={ahp} yearsStaying={yearsStaying} /> : null}

      {/* ─────────────────────── Stage 1 ─────────────────────── */}
      <div className="eyebrow" style={{ marginTop: 32 }}>Stage 1 · The math</div>
      <h2 style={{ marginTop: 0 }}>What the money says</h2>
      <p className="lede">
        A month-by-month simulation: whoever pays less for housing invests the difference, and
        the renter starts with the buyer&apos;s down payment and closing costs already invested.
        Both households spend the same amount on everything else.
      </p>

      <div className="calc-grid">
        <div className="panel">
          <div className="eyebrow" style={{ marginBottom: 20 }}>The Home</div>
          <NumField label="Home price" value={homePrice} onChange={setHomePrice} prefix="$" />
          <NumField label="Down payment" hint="% of home price" value={downPaymentPct} onChange={setDownPaymentPct} suffix="%" step={1} max={100} />
          <div className="field-row">
            <NumField label="Mortgage rate" value={mortgageRatePct} onChange={setMortgageRatePct} suffix="%" step={0.05} max={30} />
            <ToggleGroup
              label="Loan term"
              value={loanTermYears}
              onChange={setLoanTermYears}
              options={[
                { value: 15, label: "15 yr" },
                { value: 20, label: "20 yr" },
                { value: 30, label: "30 yr" },
              ]}
            />
          </div>

          <div className="eyebrow" style={{ margin: "32px 0 20px" }}>The Alternative</div>
          <NumField label="Monthly rent" hint="equivalent unit today" value={monthlyRent} onChange={setMonthlyRent} prefix="$" />
          <div className="field-row">
            <NumField label="Rent growth" value={rentGrowthPct} onChange={setRentGrowthPct} suffix="%/yr" step={0.1} max={20} />
            <NumField label="Investment return" hint="on invested cash" value={investmentReturnPct} onChange={setInvestmentReturnPct} suffix="%/yr" step={0.1} max={30} />
          </div>
          <NumField label="Years staying" hint="the holding period" value={yearsStaying} onChange={setYearsStaying} suffix="yrs" step={1} min={1} max={40} />

          <details className="advanced" style={{ marginTop: 24 }}>
            <summary>Advanced settings</summary>
            <div style={{ paddingTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Ongoing Ownership Costs</div>
              <div className="field-row">
                <NumField label="Property tax" hint="% of value / yr" value={propertyTaxPct} onChange={setPropertyTaxPct} suffix="%" step={0.05} max={5} />
                <NumField label="Home insurance" hint="per year" value={homeInsuranceAnnual} onChange={setHomeInsuranceAnnual} prefix="$" />
              </div>
              <div className="field-row">
                <NumField label="HOA" hint="per month" value={hoaMonthly} onChange={setHoaMonthly} prefix="$" />
                <NumField label="Maintenance" hint="% of value / yr" value={maintenancePct} onChange={setMaintenancePct} suffix="%" step={0.1} max={5} />
              </div>

              <div className="eyebrow" style={{ margin: "24px 0 16px" }}>Transaction &amp; Market</div>
              <div className="field-row">
                <NumField label="Buying closing costs" hint="% of price" value={buyingClosingCostsPct} onChange={setBuyingClosingCostsPct} suffix="%" step={0.5} max={15} />
                <NumField label="Selling costs" hint="% of sale price" value={sellingCostsPct} onChange={setSellingCostsPct} suffix="%" step={0.5} max={15} />
              </div>
              <div className="field-row">
                <NumField label="Home appreciation" value={appreciationPct} onChange={setAppreciationPct} suffix="%/yr" step={0.1} max={20} />
                <NumField label="Renter's insurance" hint="per year" value={rentersInsuranceAnnual} onChange={setRentersInsuranceAnnual} prefix="$" />
              </div>
              <NumField label="General inflation" hint="HOA, insurance, other costs" value={inflationPct} onChange={setInflationPct} suffix="%/yr" step={0.1} max={20} />

              <div className="eyebrow" style={{ margin: "24px 0 16px" }}>Taxes</div>
              <label className="check" style={{ marginBottom: 14 }}>
                <input type="checkbox" checked={applyTaxBenefit} onChange={(e) => setApplyTaxBenefit(e.target.checked)} />
                <span>Apply the mortgage interest / property tax deduction when itemizing beats the standard deduction</span>
              </label>
              <div className="field-row">
                <NumField label="Marginal tax rate" value={marginalTaxRatePct} onChange={setMarginalTaxRatePct} suffix="%" step={1} max={50} />
                <NumField label="Capital gains rate" hint="on invested growth" value={capitalGainsRatePct} onChange={setCapitalGainsRatePct} suffix="%" step={1} max={50} />
              </div>
              <div className="field-row">
                <NumField label="Standard deduction" hint="2026, MFJ" value={standardDeduction} onChange={setStandardDeduction} prefix="$" />
                <NumField label="SALT cap" hint="2026" value={saltCap} onChange={setSaltCap} prefix="$" />
              </div>
            </div>
          </details>
        </div>

        <div className="calc-results">
          <div className="panel">
            <div className="headline-figure">
              <div className="label">What the money says</div>
              <div className="value num" style={{ fontSize: "clamp(24px, 3.6vw, 34px)" }} aria-live="polite">
                {headlineText}
              </div>
            </div>
            <div className="statement">
              <StatementRow
                k="Break-even year"
                v={res.breakEvenYear ? `Year ${res.breakEvenYear}` : "Not within horizon"}
              />
              <StatementRow k="Down payment + closing costs" v={fmtC((res.downPaymentDollar + res.buyingClosingCostsDollar) * 100)} />
              {finalRow ? (
                <>
                  <StatementRow k={`Home value, year ${finalRow.year}`} v={fmtC(finalRow.homeValue * 100)} />
                  <StatementRow k="Equity after selling costs" v={fmtC(finalRow.equityAfterSelling * 100)} />
                  <StatementRow k="Net worth if buying" v={fmtC(finalRow.netWorthBuying * 100)} />
                  <StatementRow k="Net worth if renting" v={fmtC(finalRow.netWorthRenting * 100)} total />
                </>
              ) : null}
            </div>
            <ShareButtons shareUrl={shareUrl} />
          </div>
        </div>
      </div>

      <NetWorthChart rows={res.rows} breakEvenYear={res.breakEvenYear} />
      <YearTable rows={res.rows} breakEvenYear={res.breakEvenYear} />

      <section className="prose">
        <h3>How this is calculated</h3>
        <p>
          Every month, the household with the lower housing cost invests the gap at your assumed
          return; the renter starts with the buyer&apos;s down payment and closing costs already
          invested, since that cash never left their pocket. Property tax and maintenance track
          the home&apos;s appreciating value; rent, insurance, and HOA grow on their own schedules.
          At the end of the holding period the buyer sells (net of selling costs) and both sides
          pay capital gains tax on their invested growth, so every number you see is after-tax.
        </p>
      </section>

      {/* ─────────────────────── Stage 2 ─────────────────────── */}
      <div className="eyebrow" style={{ marginTop: 44 }}>Stage 2 · Your preferences</div>
      <h2 style={{ marginTop: 0 }}>What matters to you</h2>
      <p className="lede">
        This compares each factor against money alone — four judgments instead of the roughly ten
        pairwise comparisons a full pairwise AHP over five factors would need. That&apos;s a
        deliberate trade: you lose the usual internal-consistency check, you gain a much shorter
        questionnaire. Move any slider below and your combined verdict will appear at the top of
        the page.
      </p>

      <div className="panel">
        {AHP_FACTORS.map((factor, i) => {
          const state = factors[i];
          return (
            <div className="ahp-factor" key={factor.key}>
              <h3>{factor.label}</h3>
              <p className="note" style={{ marginTop: 0, marginBottom: 14 }}>{factor.description}</p>
              <DiscreteSlider
                label="Weight vs. money"
                min={WEIGHT_STEP_MIN}
                max={WEIGHT_STEP_MAX}
                value={state.weightStep}
                onChange={(v) => updateFactor(factor.key, "weightStep", v)}
                leftLabel="Money matters far more"
                rightLabel="This factor matters far more"
                wording={weightStepWording(state.weightStep)}
              />
              <DiscreteSlider
                label="Direction"
                min={WEIGHT_STEP_MIN}
                max={WEIGHT_STEP_MAX}
                value={state.directionStep}
                onChange={(v) => updateFactor(factor.key, "directionStep", v)}
                leftLabel="Clearly favors renting"
                rightLabel="Clearly favors buying"
                wording={directionStepWording(state.directionStep)}
              />
            </div>
          );
        })}
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Weight breakdown</h3>
        <WeightBars weights={ahp.weights} />
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Combined score</h3>
        <CompositionBar
          segments={[
            { label: "Rent", valueFmt: fmtPct(ahp.rentScore * 100, 0), valueC: Math.round(ahp.rentScore * 1000), color: "var(--seg-3)" },
            { label: "Buy", valueFmt: fmtPct(ahp.buyScore * 100, 0), valueC: Math.round(ahp.buyScore * 1000), color: "var(--ink)" },
          ]}
        />
        <VerdictCallout res={res} ahp={ahp} yearsStaying={yearsStaying} />
      </div>
    </>
  );
}

// ─────────────────────── Supporting pieces ───────────────────────

function SummaryStrip({
  res,
  ahp,
  yearsStaying,
}: {
  res: ReturnType<typeof rentVsBuy>;
  ahp: ReturnType<typeof computeAhp>;
  yearsStaying: number;
}) {
  const combined: "buying" | "renting" | "even" = ahp.buyScore > 0.5 ? "buying" : ahp.buyScore < 0.5 ? "renting" : "even";
  const text =
    ahp.state === "close"
      ? `Too close to call — ${fmtPct(ahp.buyScore * 100, 0)} buy vs ${fmtPct(ahp.rentScore * 100, 0)} rent.`
      : combined === "even"
      ? "About even, once your preferences are weighed in."
      : `Combined verdict: ${combined} comes out ahead, weighing the money and what matters to you.`;
  return (
    <div className="panel summary-strip" style={{ marginTop: 24 }}>
      <div className="eyebrow">Your combined verdict</div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>{text}</div>
      <p className="note" style={{ marginTop: 6 }}>
        Based on {yearsStaying} years and the preferences you&apos;ve set below. Money alone says{" "}
        {res.headline === "even" ? "it's about even" : res.headline}.
      </p>
    </div>
  );
}

// Money anchors the ramp in ink; each factor gets its own tint from the site's
// existing tonal blue scale, so the breakdown reads as one coherent instrument
// (per the design tokens) rather than a mismatched rainbow.
const WEIGHT_BAR_COLORS: Record<string, string> = {
  money: "var(--ink)",
  freedom: "var(--seg-2)",
  staying: "var(--seg-3)",
  control: "var(--accent)",
  upkeep: "var(--interest)",
};

function WeightBars({ weights }: { weights: { key: string; label: string; weight: number }[] }) {
  return (
    <div className="weight-bars">
      {weights.map((w) => (
        <div className="weight-bar-row" key={w.key}>
          <span className="weight-bar-label">{w.label}</span>
          <div className="weight-bar-track">
            <div
              className="weight-bar-fill"
              style={{ width: `${w.weight * 100}%`, background: WEIGHT_BAR_COLORS[w.key] ?? "var(--ink)" }}
            />
          </div>
          <span className="weight-bar-pct">{fmtPct(w.weight * 100, 0)}</span>
        </div>
      ))}
    </div>
  );
}

function VerdictCallout({
  res,
  ahp,
  yearsStaying,
}: {
  res: ReturnType<typeof rentVsBuy>;
  ahp: ReturnType<typeof computeAhp>;
  yearsStaying: number;
}) {
  const monthlyGap = Math.abs(res.finalDiff) / (yearsStaying * 12);
  const combined: "buying" | "renting" | "even" = ahp.buyScore > 0.5 ? "buying" : ahp.buyScore < 0.5 ? "renting" : "even";
  const margin = Math.round(Math.abs(ahp.buyScore * 100 - 50) * 2);

  if (ahp.state === "close") {
    return (
      <div className="verdict verdict-close">
        <strong>Too close to call.</strong> The combined score is {fmtPct(ahp.buyScore * 100, 0)} buy vs{" "}
        {fmtPct(ahp.rentScore * 100, 0)} rent — within a coin flip. Both choices are reasonable here;
        decide on something this model doesn&apos;t capture, like how long you actually expect to stay.
      </div>
    );
  }

  if (ahp.state === "flip" && ahp.topFactor) {
    return (
      <div className="verdict verdict-flip">
        <strong>Your preferences flip the financial answer.</strong> {ahp.topFactor.label} carries{" "}
        {fmtPct(ahp.topFactor.weight * 100, 0)} of your combined weight — enough to move the verdict
        to {combined}. Financially the gap favors{" "}
        {res.headline === "even" ? "neither side" : res.headline}; weighing it against your
        preferences, you&apos;re effectively paying about {fmtC(monthlyGap * 100)}/month for that.
      </div>
    );
  }

  return (
    <div className="verdict verdict-confirm">
      <strong>Your preferences confirm the financial answer.</strong> The combined score favors{" "}
      {combined} by about {margin} points, consistent with what the money says on its own.
    </div>
  );
}

function NetWorthChart({
  rows,
  breakEvenYear,
}: {
  rows: { year: number; netWorthBuying: number; netWorthRenting: number }[];
  breakEvenYear: number | null;
}) {
  if (rows.length < 2) return null;
  const W = 640;
  const H = 240;
  const P = { t: 14, r: 12, b: 26, l: 12 };
  const n = rows.length;
  const values = rows.flatMap((r) => [r.netWorthBuying, r.netWorthRenting]);
  const minY = Math.min(0, ...values);
  const maxY = Math.max(1, ...values);
  const x = (i: number) => P.l + (i / (n - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - (v - minY) / (maxY - minY)) * (H - P.t - P.b);

  const buyPath = rows.map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r.netWorthBuying).toFixed(1)}`).join(" ");
  const rentPath = rows.map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r.netWorthRenting).toFixed(1)}`).join(" ");

  const ticks = n >= 8 ? [0, 0.25, 0.5, 0.75, 1] : n >= 4 ? [0, 0.5, 1] : rows.map((_, i) => i / (n - 1));

  return (
    <div className="panel chart-panel">
      <h3 style={{ marginTop: 0 }}>Net worth over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Chart comparing net worth if buying versus renting over the holding period">
        <line x1={P.l} y1={y(0)} x2={W - P.r} y2={y(0)} stroke="var(--line)" />
        <path d={rentPath} fill="none" stroke="var(--interest)" strokeWidth="2" />
        <path d={buyPath} fill="none" stroke="var(--ink)" strokeWidth="2" />
        <line x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} stroke="var(--line-strong)" />
        {ticks.map((t) => {
          const idx = Math.round(t * (n - 1));
          return (
            <text key={t} x={x(idx)} y={H - 8} fontSize="11" fill="var(--ink-faint)" textAnchor={t === 0 ? "start" : t === 1 ? "end" : "middle"}>
              Yr {rows[idx].year}
            </text>
          );
        })}
      </svg>
      <div className="composition-legend">
        <span><span className="dot" style={{ background: "var(--ink)" }} />Net worth if buying</span>
        <span><span className="dot" style={{ background: "var(--interest)" }} />Net worth if renting</span>
      </div>
      {breakEvenYear ? <p className="note">Break-even: year {breakEvenYear}.</p> : null}
    </div>
  );
}

function YearTable({
  rows,
  breakEvenYear,
}: {
  rows: { year: number; homeValue: number; loanBalance: number; equityAfterSelling: number; netWorthBuying: number; netWorthRenting: number; diff: number }[];
  breakEvenYear: number | null;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="panel chart-panel">
      <h3 style={{ marginTop: 0 }}>Year by year</h3>
      <div className="amort-wrap">
        <table className="amort">
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Home value</th>
              <th scope="col">Loan balance</th>
              <th scope="col">Equity after selling</th>
              <th scope="col">Net worth, buying</th>
              <th scope="col">Net worth, renting</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} className={r.year === breakEvenYear ? "year-mark breakeven-row" : undefined}>
                <td>Year {r.year}</td>
                <td>{fmtC(r.homeValue * 100)}</td>
                <td>{fmtC(r.loanBalance * 100)}</td>
                <td>{fmtC(r.equityAfterSelling * 100)}</td>
                <td>{fmtC(r.netWorthBuying * 100)}</td>
                <td>{fmtC(r.netWorthRenting * 100)}</td>
                <td>{fmtC(r.diff * 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
