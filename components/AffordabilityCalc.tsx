"use client";

import { useEffect, useMemo, useState } from "react";
import { affordability } from "@/lib/finance";
import { fmtC, fmtCents, fmtPct } from "@/lib/format";
import { useCurrency } from "@/components/CurrencyProvider";
import { NumField, ToggleGroup, StatementRow, CompositionBar, ShareButtons } from "@/components/ui";

function readParam(sp: URLSearchParams, key: string, fallback: number): number {
  const v = Number(sp.get(key));
  return Number.isFinite(v) && sp.has(key) ? v : fallback;
}

export default function AffordabilityCalc() {
  const { currency } = useCurrency();
  const [income, setIncome] = useState(95000);
  const [debts, setDebts] = useState(400);
  const [down, setDown] = useState(40000);
  const [rate, setRate] = useState(6.6);
  const [termYears, setTermYears] = useState(30);
  const [taxPct, setTaxPct] = useState(1.1);
  const [insPct, setInsPct] = useState(0.4);
  const [hoa, setHoa] = useState(0);
  const [pmiRate, setPmiRate] = useState(0.6);
  const [frontRatio, setFrontRatio] = useState(28);
  const [backRatio, setBackRatio] = useState(36);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if ([...sp.keys()].length === 0) return;
    setIncome(readParam(sp, "inc", 95000));
    setDebts(readParam(sp, "debt", 400));
    setDown(readParam(sp, "dp", 40000));
    setRate(readParam(sp, "r", 6.6));
    setTermYears(readParam(sp, "t", 30));
    setTaxPct(readParam(sp, "tax", 1.1));
    setInsPct(readParam(sp, "ins", 0.4));
    setHoa(readParam(sp, "hoa", 0));
    setPmiRate(readParam(sp, "pmi", 0.6));
    setFrontRatio(readParam(sp, "fr", 28));
    setBackRatio(readParam(sp, "br", 36));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const res = useMemo(
    () =>
      affordability({
        annualIncome: income,
        monthlyDebts: debts,
        downPayment: down,
        annualRatePct: rate,
        termYears,
        propertyTaxPctAnnual: taxPct,
        insurancePctAnnual: insPct,
        hoaMonthly: hoa,
        pmiRatePct: pmiRate,
        frontEndRatioPct: frontRatio,
        backEndRatioPct: backRatio,
      }),
    [income, debts, down, rate, termYears, taxPct, insPct, hoa, pmiRate, frontRatio, backRatio]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams({
      inc: String(income), debt: String(debts), dp: String(down), r: String(rate), t: String(termYears),
      tax: String(taxPct), ins: String(insPct), hoa: String(hoa), pmi: String(pmiRate),
      fr: String(frontRatio), br: String(backRatio),
    });
    return `${window.location.origin}${window.location.pathname}?${sp}`;
  }, [income, debts, down, rate, termYears, taxPct, insPct, hoa, pmiRate, frontRatio, backRatio]);

  return (
    <>
      <div className="calc-grid">
        <div className="panel">
          <div className="eyebrow" style={{ marginBottom: 20 }}>Your Finances</div>
          <NumField label="Gross annual income" value={income} onChange={setIncome} prefix={currency.symbol} />
          <NumField
            label="Other monthly debts"
            hint="car loans, student loans, minimum credit card payments"
            value={debts}
            onChange={setDebts}
            prefix={currency.symbol}
          />
          <NumField label="Down payment available" value={down} onChange={setDown} prefix={currency.symbol} />
          <div className="field-row">
            <NumField label="Interest rate" value={rate} onChange={setRate} suffix="%" step={0.05} max={30} />
            <ToggleGroup
              label="Loan term"
              value={termYears}
              onChange={setTermYears}
              options={[
                { value: 15, label: "15 yr" },
                { value: 20, label: "20 yr" },
                { value: 30, label: "30 yr" },
              ]}
            />
          </div>
          <div className="eyebrow" style={{ margin: "32px 0 20px" }}>Estimated Costs</div>
          <div className="field-row">
            <NumField label="Property tax" hint="% of home price / yr" value={taxPct} onChange={setTaxPct} suffix="%" step={0.05} max={5} />
            <NumField label="Home insurance" hint="% of home price / yr" value={insPct} onChange={setInsPct} suffix="%" step={0.05} max={5} />
          </div>
          <div className="field-row">
            <NumField label="HOA fees" hint="per month" value={hoa} onChange={setHoa} prefix={currency.symbol} />
            <NumField label="PMI rate" hint="if under 20% down" value={pmiRate} onChange={setPmiRate} suffix="%/yr" step={0.1} max={5} />
          </div>
          <div className="eyebrow" style={{ margin: "32px 0 20px" }}>Debt-to-Income Limits</div>
          <div className="field-row">
            <NumField label="Front-end (housing only)" hint="standard: 28%" value={frontRatio} onChange={setFrontRatio} suffix="%" step={1} max={60} />
            <NumField label="Back-end (housing + debts)" hint="standard: 36%" value={backRatio} onChange={setBackRatio} suffix="%" step={1} max={60} />
          </div>
        </div>

        <div className="calc-results">
          <div className="panel">
            <div className="headline-figure">
              <div className="label">Estimated home price you can afford</div>
              <div className="value num" aria-live="polite">
                {fmtC(res.maxHomePriceC)}
              </div>
            </div>
            <CompositionBar
              segments={[
                { label: "Principal & Interest", valueFmt: fmtCents(res.piC), valueC: res.piC, color: "var(--seg-1)" },
                { label: "Property Tax", valueFmt: fmtCents(res.taxMonthlyC), valueC: res.taxMonthlyC, color: "var(--seg-2)" },
                { label: "Insurance", valueFmt: fmtCents(res.insuranceMonthlyC), valueC: res.insuranceMonthlyC, color: "var(--seg-3)" },
                { label: "PMI", valueFmt: fmtCents(res.pmiMonthlyC), valueC: res.pmiMonthlyC, color: "var(--seg-4)" },
                { label: "HOA", valueFmt: fmtCents(res.hoaMonthlyC), valueC: res.hoaMonthlyC, color: "var(--seg-5)" },
              ]}
            />
            <div className="statement">
              <StatementRow k="Maximum loan amount" v={fmtC(res.maxLoanC)} />
              <StatementRow k="Maximum monthly housing payment" v={fmtCents(res.maxMonthlyPaymentC)} />
              <StatementRow k="Front-end DTI at this price" v={fmtPct(res.frontEndDTIPct, 1)} />
              <StatementRow k="Back-end DTI at this price" v={fmtPct(res.backEndDTIPct, 1)} total />
            </div>
            <p className="note">
              {res.bindingConstraint === "front-end"
                ? "Your income is the limiting factor here — you're well within the standard back-end debt limit."
                : "Your existing monthly debts are the limiting factor here, not your income. Paying down a car loan or credit card balance before applying could raise your affordable price more than a larger down payment would."}
            </p>
            <ShareButtons shareUrl={shareUrl} />
          </div>
        </div>
      </div>

      <section className="prose">
        <h2>How this is calculated</h2>
        <p>
          Lenders typically cap your housing payment (principal, interest, taxes, insurance, PMI, and
          HOA) at 28% of your gross monthly income — the front-end ratio — and cap your total debt
          payments, including housing, at 36% — the back-end ratio. This calculator finds the highest
          home price where your estimated monthly housing cost stays under whichever ratio is more
          restrictive for your situation, then shows the full breakdown at that price.
        </p>
      </section>
    </>
  );
}
