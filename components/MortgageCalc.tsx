"use client";

import { useEffect, useMemo, useState } from "react";
import { mortgage } from "@/lib/finance";
import { fmtC, fmtCents, fmtMonths, fmtPct } from "@/lib/format";
import { NumField, ToggleGroup, DualDownPaymentField, StatementRow, CompositionBar, ShareButtons } from "@/components/ui";
import { AmortTable, BalanceChart } from "@/components/amort";

export interface MortgagePreset {
  homePrice?: number;
  downPayment?: number;
  rate?: number;
  termYears?: number;
}

function readParam(sp: URLSearchParams, key: string, fallback: number): number {
  const v = Number(sp.get(key));
  return Number.isFinite(v) && sp.has(key) ? v : fallback;
}

export default function MortgageCalc({ preset }: { preset?: MortgagePreset }) {
  const [homePrice, setHomePrice] = useState(preset?.homePrice ?? 425000);
  const [downPayment, setDownPayment] = useState(preset?.downPayment ?? 85000);
  const [rate, setRate] = useState(preset?.rate ?? 6.6);
  const [termYears, setTermYears] = useState(preset?.termYears ?? 30);
  const [taxAnnual, setTaxAnnual] = useState(4500);
  const [insAnnual, setInsAnnual] = useState(1800);
  const [hoa, setHoa] = useState(0);
  const [pmiRate, setPmiRate] = useState(0.6);
  const [extra, setExtra] = useState(0);

  // Hydrate from shareable URL once on mount.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if ([...sp.keys()].length === 0) return;
    setHomePrice(readParam(sp, "hp", preset?.homePrice ?? 425000));
    setDownPayment(readParam(sp, "dp", preset?.downPayment ?? 85000));
    setRate(readParam(sp, "r", preset?.rate ?? 6.6));
    setTermYears(readParam(sp, "t", preset?.termYears ?? 30));
    setTaxAnnual(readParam(sp, "tax", 4500));
    setInsAnnual(readParam(sp, "ins", 1800));
    setHoa(readParam(sp, "hoa", 0));
    setPmiRate(readParam(sp, "pmi", 0.6));
    setExtra(readParam(sp, "x", 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const res = useMemo(
    () =>
      mortgage({
        homePrice,
        downPayment,
        annualRatePct: rate,
        termYears,
        propertyTaxAnnual: taxAnnual,
        insuranceAnnual: insAnnual,
        hoaMonthly: hoa,
        pmiRatePct: pmiRate,
        extraMonthly: extra,
      }),
    [homePrice, downPayment, rate, termYears, taxAnnual, insAnnual, hoa, pmiRate, extra]
  );

  const downPct = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams({
      hp: String(homePrice), dp: String(downPayment), r: String(rate), t: String(termYears),
      tax: String(taxAnnual), ins: String(insAnnual), hoa: String(hoa), pmi: String(pmiRate), x: String(extra),
    });
    return `${window.location.origin}${window.location.pathname}?${sp}`;
  }, [homePrice, downPayment, rate, termYears, taxAnnual, insAnnual, hoa, pmiRate, extra]);

  const baseline = useMemo(
    () =>
      extra > 0
        ? mortgage({
            homePrice, downPayment, annualRatePct: rate, termYears,
            propertyTaxAnnual: taxAnnual, insuranceAnnual: insAnnual,
            hoaMonthly: hoa, pmiRatePct: pmiRate, extraMonthly: 0,
          })
        : null,
    [extra, homePrice, downPayment, rate, termYears, taxAnnual, insAnnual, hoa, pmiRate]
  );

  return (
    <>
      <div className="calc-grid">
        <div className="panel">
          <div className="eyebrow" style={{ marginBottom: 20 }}>Loan Details</div>
          <NumField label="Home price" value={homePrice} onChange={setHomePrice} prefix="$" />
          <DualDownPaymentField
            homePrice={homePrice}
            downPayment={downPayment}
            onChange={(v) => setDownPayment(Math.min(v, homePrice))}
          />
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
          <div className="eyebrow" style={{ margin: "32px 0 20px" }}>Monthly Costs</div>
          <div className="field-row">
            <NumField label="Property tax" hint="per year" value={taxAnnual} onChange={setTaxAnnual} prefix="$" />
            <NumField label="Home insurance" hint="per year" value={insAnnual} onChange={setInsAnnual} prefix="$" />
          </div>
          <div className="field-row">
            <NumField label="HOA fees" hint="per month" value={hoa} onChange={setHoa} prefix="$" />
            <NumField
              label="PMI rate"
              hint={downPct >= 20 ? "waived at 20% down" : "if under 20% down"}
              value={pmiRate}
              onChange={setPmiRate}
              suffix="%/yr"
              step={0.1}
              max={5}
            />
          </div>
          <NumField label="Extra monthly payment" hint="optional" value={extra} onChange={setExtra} prefix="$" />
        </div>

        <div className="calc-results">
          <div className="panel">
            <div className="headline-figure">
              <div className="label">Estimated monthly payment</div>
              <div className="value num" aria-live="polite">
                {fmtCents(res.allInMonthlyC)}<small>/mo</small>
              </div>
            </div>
            <CompositionBar
              segments={[
                { label: "Principal & Interest", valueFmt: fmtCents(res.paymentC), valueC: res.paymentC, color: "var(--seg-1)" },
                { label: "Property Tax", valueFmt: fmtCents(res.taxMonthlyC), valueC: res.taxMonthlyC, color: "var(--seg-2)" },
                { label: "Insurance", valueFmt: fmtCents(res.insuranceMonthlyC), valueC: res.insuranceMonthlyC, color: "var(--seg-3)" },
                { label: "PMI", valueFmt: fmtCents(res.pmiMonthlyC), valueC: res.pmiMonthlyC, color: "var(--seg-4)" },
                { label: "HOA", valueFmt: fmtCents(res.hoaMonthlyC), valueC: res.hoaMonthlyC, color: "var(--seg-5)" },
              ]}
            />
            <div className="statement">
              <StatementRow k="Loan amount" v={fmtC(res.loanC)} />
              <StatementRow k="Total interest over life of loan" v={fmtC(res.totalInterestC)} />
              {res.pmiMonthlyC > 0 && res.pmiDropMonth > 0 ? (
                <StatementRow
                  k={`PMI (drops off after ${fmtMonths(res.pmiDropMonth)})`}
                  v={fmtC(res.totalPmiC)}
                />
              ) : null}
              <StatementRow k="Payoff time" v={fmtMonths(res.payoffMonths)} good={extra > 0} />
              {baseline ? (
                <StatementRow
                  k={`Interest saved by paying ${fmtC(extra * 100)} extra`}
                  v={fmtC(baseline.totalInterestC - res.totalInterestC)}
                  good
                />
              ) : null}
              <StatementRow k="Total of all P&I payments" v={fmtC(res.totalPaidC)} total />
            </div>
            {downPct < 20 && homePrice > 0 ? (
              <p className="note">
                Down payment is under 20%, so PMI is included. It drops automatically once the
                balance reaches 80% of the home's value{res.pmiDropMonth > 0 ? ` — about ${fmtMonths(res.pmiDropMonth)} in` : ""}.
              </p>
            ) : null}
            <ShareButtons shareUrl={shareUrl} />
          </div>
        </div>
      </div>

      <BalanceChart schedule={res.schedule} principalC={res.loanC} />
      <AmortTable schedule={res.schedule} />

      <section className="prose">
        <h2>How this is calculated</h2>
        <p>
          Principal &amp; interest use the standard fixed-rate formula: M = P × r(1+r)ⁿ ⁄ ((1+r)ⁿ − 1),
          where P is the loan amount, r the monthly rate ({fmtPct(rate)} ÷ 12), and n the number of
          payments. Taxes, insurance, and HOA are divided into monthly amounts and added on top.
          PMI is estimated at {fmtPct(pmiRate, 1)} of the loan per year and removed once your
          balance falls to 80% of the home price, matching how conventional lenders handle it.
          All math runs in your browser to the exact cent.
        </p>
      </section>
    </>
  );
}
