"use client";

import { useState } from "react";
import { useCurrency } from "./CurrencyProvider";
import { roi } from "@/lib/investing";
import { NumField } from "./ui";

export default function RoiCalc() {
  const { fmtC, currency } = useCurrency();
  const [invested, setInvested] = useState(10000);
  const [returned, setReturned] = useState(15000);
  const [years, setYears] = useState(5);

  const res = roi(invested, returned, years);

  return (
    <div className="calc-grid">
      <div className="calc-inputs">
        <div className="panel">
          <NumField label="Amount Invested" value={invested} onChange={setInvested} prefix={currency.symbol} />
          <NumField label="Amount Returned" value={returned} onChange={setReturned} prefix={currency.symbol} />
          <NumField label="Investment Length (Years)" value={years} onChange={setYears} max={100} />
        </div>
      </div>

      <div className="calc-results">
        <div className="panel">
          <div className="headline-figure">
            <div className="label">Total Return on Investment</div>
            <div className="value">{res.roiPct.toFixed(2)}%</div>
          </div>
          
          <div className="statement">
            <div className="statement-row">
              <span className="k">Net Profit</span>
              <span className="v good">{fmtC(res.netProfitC)}</span>
            </div>
            <div className="statement-row">
              <span className="k">Annualized ROI</span>
              <span className="v">{res.annualizedRoiPct.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
