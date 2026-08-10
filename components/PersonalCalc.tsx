"use client";

import { useMemo, useState } from "react";
import { personalLoan } from "@/lib/finance";
import { fmtMonths, fmtPct } from "@/lib/format";
import { useCurrency } from "./CurrencyProvider";
import { NumField, SelectField, StatementRow, CompositionBar, ShareButtons } from "@/components/ui";
import { AmortTable, BalanceChart } from "@/components/amort";

export default function PersonalCalc() {
  const { currency, fmtC, fmtCents } = useCurrency();
  const [amount, setAmount] = useState(15000);
  const [rate, setRate] = useState(11.5);
  const [term, setTerm] = useState(36);
  const [feePct, setFeePct] = useState(0);
  const [extra, setExtra] = useState(0);

  const res = useMemo(
    () =>
      personalLoan({
        amount,
        annualRatePct: rate,
        termMonths: term,
        originationFeePct: feePct,
        extraMonthly: extra,
      }),
    [amount, rate, term, feePct, extra]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams({
      a: String(amount), r: String(rate), t: String(term), f: String(feePct), x: String(extra),
    });
    return `${window.location.origin}${window.location.pathname}?${sp}`;
  }, [amount, rate, term, feePct, extra]);

  return (
    <>
      <div className="calc-grid">
        <div className="panel">
          <NumField label="Loan amount" value={amount} onChange={setAmount} prefix={currency.symbol} />
          <div className="field-row">
            <NumField label="Interest rate" value={rate} onChange={setRate} suffix="%" step={0.1} max={30} />
            <SelectField
              label="Loan term"
              value={term}
              onChange={setTerm}
              options={[12, 24, 36, 48, 60, 72].map((m) => ({ value: m, label: `${m} months` }))}
            />
          </div>
          <NumField
            label="Origination fee"
            hint="often 0–10%, deducted from what you receive"
            value={feePct}
            onChange={setFeePct}
            suffix="%"
            step={0.5}
            max={12}
          />
          <NumField label="Extra monthly payment" hint="optional" value={extra} onChange={setExtra} prefix={currency.symbol} />
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
                { label: "Principal", valueFmt: fmtC(res.totalPaidC - res.totalInterestC), valueC: res.totalPaidC - res.totalInterestC, color: "var(--seg-1)" },
                { label: "Interest", valueFmt: fmtC(res.totalInterestC), valueC: res.totalInterestC, color: "var(--interest)" },
              ]}
            />
            <div className="statement">
              {res.feeC > 0 ? (
                <>
                  <StatementRow k="Origination fee" v={fmtC(res.feeC)} />
                  <StatementRow k="Cash you actually receive" v={fmtC(res.disbursedC)} />
                  <StatementRow k="Effective APR including fee" v={fmtPct(res.effectiveAprPct)} />
                </>
              ) : null}
              <StatementRow k="Total interest" v={fmtC(res.totalInterestC)} />
              <StatementRow k="Payoff time" v={fmtMonths(res.payoffMonths)} good={extra > 0} />
              <StatementRow k="Total repaid" v={fmtC(res.totalPaidC)} total />
            </div>
            {res.feeC > 0 ? (
              <p className="note">
                The fee is deducted up front, so you receive {fmtC(res.disbursedC)} but repay
                interest on the full {fmtC(res.totalPaidC - res.totalInterestC)}. That's why the
                effective APR ({fmtPct(res.effectiveAprPct)}) is higher than the quoted rate —
                use it when comparing offers.
              </p>
            ) : null}
            <ShareButtons shareUrl={shareUrl} />
          </div>
        </div>
      </div>

      <BalanceChart schedule={res.schedule} principalC={res.totalPaidC - res.totalInterestC} />
      <AmortTable schedule={res.schedule} />

      <section className="prose">
        <h2>How this is calculated</h2>
        <p>
          Payments use the standard fixed-rate amortization formula on the full loan amount.
          When an origination fee applies, we also solve for the effective APR — the rate that
          makes your payment stream equal in value to the cash you actually received. Federal
          Truth in Lending rules require lenders to disclose APR this way, and it's the only
          fair basis for comparing offers with different fees.
        </p>
      </section>
    </>
  );
}
