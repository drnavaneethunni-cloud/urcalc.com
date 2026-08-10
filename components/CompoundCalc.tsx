"use client";

import { useState } from "react";
import { useCurrency } from "./CurrencyProvider";
import { compoundInterest } from "@/lib/investing";
import { NumField } from "./ui";

export default function CompoundCalc() {
  const { fmtC, currency } = useCurrency();
  const [init, setInit] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const res = compoundInterest(init, monthly, rate, years);

  const maxVal = res.finalBalanceC;
  const initPct = (res.schedule[0]?.contributedC / maxVal) * 100 || 0; // rough visual
  // For the composition bar, we'll just show Principal vs Interest
  const totalPrincipalPct = (res.totalContributedC / maxVal) * 100;
  const totalInterestPct = (res.totalInterestC / maxVal) * 100;

  return (
    <div className="calc-grid">
      <div className="calc-inputs">
        <div className="panel">
          <NumField label="Initial investment" value={init} onChange={setInit} prefix={currency.symbol} />
          <NumField label="Monthly contribution" value={monthly} onChange={setMonthly} prefix={currency.symbol} />
          <div className="field-row">
            <NumField label="Annual return rate" value={rate} onChange={setRate} suffix="%" />
            <NumField label="Years to grow" value={years} onChange={setYears} max={100} />
          </div>
        </div>
      </div>

      <div className="calc-results">
        <div className="panel">
          <div className="headline-figure">
            <div className="label">Future Balance</div>
            <div className="value">{fmtC(res.finalBalanceC)}</div>
          </div>
          <div className="composition">
            <div className="composition-bar">
              <span style={{ width: `${totalPrincipalPct}%`, background: "var(--accent)" }} />
              <span style={{ width: `${totalInterestPct}%`, background: "var(--interest)" }} />
            </div>
            <div className="composition-legend">
              <div className="row">
                <span>
                  <span className="dot" style={{ background: "var(--accent)" }} />
                  Total Contributions
                </span>
                <span className="v">{fmtC(res.totalContributedC)}</span>
              </div>
              <div className="row">
                <span>
                  <span className="dot" style={{ background: "var(--interest)" }} />
                  Total Interest / Growth
                </span>
                <span className="v">{fmtC(res.totalInterestC)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
