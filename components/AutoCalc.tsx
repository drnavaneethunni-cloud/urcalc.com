"use client";

import { useMemo, useState } from "react";
import { autoLoan } from "@/lib/finance";
import { fmtC, fmtCents, fmtMonths } from "@/lib/format";
import { NumField, ToggleGroup, StatementRow, CompositionBar, ShareButtons } from "@/components/ui";
import { AmortTable, BalanceChart } from "@/components/amort";

export default function AutoCalc() {
  const [price, setPrice] = useState(38000);
  const [down, setDown] = useState(4000);
  const [trade, setTrade] = useState(0);
  const [owed, setOwed] = useState(0);
  const [taxPct, setTaxPct] = useState(6.5);
  const [fees, setFees] = useState(500);
  const [rate, setRate] = useState(7.2);
  const [term, setTerm] = useState(60);
  const [taxAfterTrade, setTaxAfterTrade] = useState(true);

  const res = useMemo(
    () =>
      autoLoan({
        vehiclePrice: price,
        downPayment: down,
        tradeInValue: trade,
        amountOwedOnTradeIn: owed,
        salesTaxPct: taxPct,
        fees,
        annualRatePct: rate,
        termMonths: term,
        taxAfterTradeIn: taxAfterTrade,
      }),
    [price, down, trade, owed, taxPct, fees, rate, term, taxAfterTrade]
  );

  const negativeEquity = owed > trade && trade >= 0 ? owed - trade : 0;

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams({
      p: String(price), d: String(down), tr: String(trade), ow: String(owed),
      tx: String(taxPct), f: String(fees), r: String(rate), t: String(term),
    });
    return `${window.location.origin}${window.location.pathname}?${sp}`;
  }, [price, down, trade, owed, taxPct, fees, rate, term]);

  return (
    <>
      <div className="calc-grid">
        <div className="panel">
          <NumField label="Vehicle price" value={price} onChange={setPrice} prefix="$" />
          <div className="field-row">
            <NumField label="Down payment" value={down} onChange={setDown} prefix="$" />
            <NumField label="Trade-in value" value={trade} onChange={setTrade} prefix="$" />
          </div>
          <NumField
            label="Still owed on trade-in"
            hint="rolls into the new loan if more than trade-in value"
            value={owed}
            onChange={setOwed}
            prefix="$"
          />
          <div className="field-row">
            <NumField label="Sales tax" value={taxPct} onChange={setTaxPct} suffix="%" step={0.1} max={15} />
            <NumField label="Title & fees" value={fees} onChange={setFees} prefix="$" />
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={taxAfterTrade}
              onChange={(e) => setTaxAfterTrade(e.target.checked)}
            />
            <span>
              Tax applies after trade-in credit (most states). Uncheck for states like
              California that tax the full price.
            </span>
          </label>
          <div style={{ marginTop: 14 }}>
            <NumField label="Interest rate" value={rate} onChange={setRate} suffix="%" step={0.1} max={30} />
            <ToggleGroup
              label="Loan term (months)"
              value={term}
              onChange={setTerm}
              options={[36, 48, 60, 72, 84].map((m) => ({ value: m, label: `${m}` }))}
            />
          </div>
        </div>

        <div className="calc-results">
          <div className="panel">
            <div className="headline-figure">
              <div className="label">Estimated monthly payment</div>
              <div className="value num" aria-live="polite">
                {fmtCents(res.paymentC)}<small>/mo</small>
              </div>
            </div>
            <CompositionBar
              segments={[
                { label: "Principal", valueFmt: fmtC(res.financedC), valueC: res.financedC, color: "var(--seg-1)" },
                { label: "Interest", valueFmt: fmtC(res.totalInterestC), valueC: res.totalInterestC, color: "var(--interest)" },
              ]}
            />
            <div className="statement">
              <StatementRow k="Amount financed" v={fmtC(res.financedC)} />
              <StatementRow k="Sales tax included" v={fmtC(res.taxC)} />
              {negativeEquity > 0 ? (
                <StatementRow k="Negative equity rolled in" v={fmtC(negativeEquity * 100)} />
              ) : null}
              <StatementRow k="Total interest" v={fmtC(res.totalInterestC)} />
              <StatementRow k="Payoff time" v={fmtMonths(res.payoffMonths)} />
              <StatementRow k="Total cost of financing" v={fmtC(res.totalPaidC)} total />
            </div>
            {term >= 72 ? (
              <p className="note">
                Heads up: {term}-month terms lower the payment but cost significantly more in
                interest, and long loans spend years underwater relative to the car's value.
                Compare against 60 months before deciding.
              </p>
            ) : null}
            {negativeEquity > 0 ? (
              <p className="note">
                You owe {fmtC(negativeEquity * 100)} more than your trade-in is worth. That amount
                is added to the new loan, so you're financing it at {rate}% too.
              </p>
            ) : null}
            <ShareButtons shareUrl={shareUrl} />
          </div>
        </div>
      </div>

      <BalanceChart schedule={res.schedule} principalC={res.financedC} />
      <AmortTable schedule={res.schedule} />

      <section className="prose">
        <h2>How this is calculated</h2>
        <p>
          Amount financed = vehicle price + fees + sales tax − down payment − net trade-in
          (trade-in value minus anything still owed). If you owe more than the trade-in is
          worth, the difference rolls into the new loan. Monthly payments use the standard
          amortization formula, computed to the exact cent with the final payment adjusted so
          the balance lands on zero.
        </p>
      </section>
    </>
  );
}
