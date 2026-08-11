"use client";

import { useState } from "react";
import type { ScheduleRow } from "@/lib/finance";
import { useCurrency } from "@/components/CurrencyProvider";

/** Zero-dependency SVG chart: balance line + cumulative interest area. */
export function BalanceChart({ schedule, principalC }: { schedule: ScheduleRow[]; principalC: number }) {
  if (schedule.length < 2 || principalC <= 0) return null;
  const W = 640;
  const H = 220;
  const P = { t: 12, r: 12, b: 26, l: 12 };
  const n = schedule.length;

  let cumInterest = 0;
  const interestPts: number[] = [];
  for (const row of schedule) {
    cumInterest += row.interestC;
    interestPts.push(cumInterest);
  }
  const maxY = Math.max(principalC, cumInterest);
  const x = (i: number) => P.l + (i / (n - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - v / maxY) * (H - P.t - P.b);

  const balancePath = schedule.map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r.balanceC).toFixed(1)}`).join(" ");
  const interestLine = interestPts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const interestArea = `${interestLine} L${x(n - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  const years = Math.round(n / 12);
  const ticks = years >= 4 ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1];

  return (
    <div className="panel chart-panel">
      <h3 style={{ marginTop: 0 }}>Balance over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Chart of remaining balance and cumulative interest over the loan term">
        <path d={interestArea} fill="var(--interest-soft)" stroke="none" />
        <path d={interestLine} fill="none" stroke="var(--interest)" strokeWidth="1.5" />
        <path d={balancePath} fill="none" stroke="var(--ink)" strokeWidth="2" />
        <line x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} stroke="var(--line-strong)" />
        {ticks.map((t) => {
          const m = Math.round(t * (n - 1));
          return (
            <text key={t} x={x(m)} y={H - 8} fontSize="13" fill="var(--ink-faint)" textAnchor={t === 0 ? "start" : t === 1 ? "end" : "middle"}>
              {t === 0 ? "Now" : `Yr ${Math.round(m / 12)}`}
            </text>
          );
        })}
      </svg>
      <div className="composition-legend">
        <span><span className="dot" style={{ background: "var(--ink)" }} />Remaining balance</span>
        <span><span className="dot" style={{ background: "var(--interest)" }} />Cumulative interest</span>
      </div>
    </div>
  );
}

export function AmortTable({ schedule }: { schedule: ScheduleRow[] }) {
  const { fmtC, fmtCents } = useCurrency();
  const [expanded, setExpanded] = useState(false);
  if (schedule.length === 0) return null;

  // Collapsed view: yearly summaries. Expanded: every month.
  const rows: { label: string; interestC: number; principalC: number; balanceC: number; yearMark: boolean }[] = [];
  if (expanded) {
    for (const r of schedule) {
      rows.push({
        label: `Month ${r.month}`,
        interestC: r.interestC,
        principalC: r.principalC,
        balanceC: r.balanceC,
        yearMark: r.month % 12 === 0,
      });
    }
  } else {
    let yi = 0, yp = 0;
    for (const r of schedule) {
      yi += r.interestC;
      yp += r.principalC;
      if (r.month % 12 === 0 || r.month === schedule.length) {
        rows.push({
          label: `Year ${Math.ceil(r.month / 12)}`,
          interestC: yi,
          principalC: yp,
          balanceC: r.balanceC,
          yearMark: false,
        });
        yi = 0; yp = 0;
      }
    }
  }

  return (
    <div className="panel chart-panel">
      <h3 style={{ marginTop: 0 }}>Amortization schedule</h3>
      <div className="amort-wrap">
        <table className="amort">
          <thead>
            <tr>
              <th scope="col">{expanded ? "Month" : "Year"}</th>
              <th scope="col">Principal</th>
              <th scope="col">Interest</th>
              <th scope="col">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={r.yearMark ? "year-mark" : undefined}>
                <td>{r.label}</td>
                <td>{expanded ? fmtCents(r.principalC) : fmtC(r.principalC)}</td>
                <td>{expanded ? fmtCents(r.interestC) : fmtC(r.interestC)}</td>
                <td>{fmtC(r.balanceC)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="btn-row">
        <button className="btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show yearly summary" : "Show every month"}
        </button>
      </div>
    </div>
  );
}
