"use client";

import { useCallback } from "react";
import { useCurrency } from "./CurrencyProvider";

/** Numeric input that tolerates commas, blanks, and partial typing. */
export function NumField({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  step,
  min = 0,
  max,
  ariaLabel,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) {
  const handle = useCallback(
    (raw: string) => {
      // Removing any non-numeric typical chars
      const cleaned = raw.replace(/[,$\s€£¥₹C]/g, "");
      if (cleaned === "" || cleaned === "-" || cleaned === ".") {
        onChange(0);
        return;
      }
      const n = Number(cleaned);
      if (Number.isFinite(n)) onChange(n);
    },
    [onChange]
  );

  return (
    <div className="field">
      <label>
        <span>{label}</span>
        {hint ? <span className="hint">{hint}</span> : null}
      </label>
      <div className="input-wrap">
        {prefix ? <span className="affix">{prefix}</span> : null}
        <input
          type="number"
          inputMode="decimal"
          aria-label={ariaLabel ?? label}
          value={value === 0 ? "" : value}
          placeholder="0"
          min={min}
          max={max}
          step={step ?? "any"}
          onChange={(e) => handle(e.target.value)}
        />
        {suffix ? <span className="affix suffix">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <div className="field">
      <label>
        <span>{label}</span>
      </label>
      <div className="input-wrap">
        <select value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** Pill button group for a small set of discrete choices (e.g. loan term). */
export function ToggleGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <div className="field">
      <label>
        <span>{label}</span>
      </label>
      <div className="toggle-group" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`toggle-btn${value === o.value ? " active" : ""}`}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Down payment as synced currency amount + % fields. */
export function DualDownPaymentField({
  homePrice,
  downPayment,
  onChange,
}: {
  homePrice: number;
  downPayment: number;
  onChange: (v: number) => void;
}) {
  const { currency } = useCurrency();
  const pct = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
  return (
    <div className="field">
      <label>
        <span>Down Payment</span>
      </label>
      <div className="dual-field">
        <div className="input-wrap">
          <span className="affix">{currency.symbol}</span>
          <input
            type="number"
            aria-label="Down payment amount"
            value={downPayment === 0 ? "" : Math.round(downPayment)}
            placeholder="0"
            onChange={(e) => {
              const n = Number(e.target.value.replace(/[,$\s€£¥₹C]/g, ""));
              onChange(Number.isFinite(n) ? Math.min(n, homePrice) : 0);
            }}
          />
        </div>
        <div className="input-wrap">
          <input
            type="number"
            aria-label="Down payment percent"
            value={pct === 0 ? "" : Number(pct.toFixed(1))}
            placeholder="0"
            step={0.1}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange(Number.isFinite(n) ? (homePrice * n) / 100 : 0);
            }}
          />
          <span className="affix suffix">%</span>
        </div>
      </div>
    </div>
  );
}

export function StatementRow({
  k,
  v,
  good,
  total,
}: {
  k: string;
  v: string;
  good?: boolean;
  total?: boolean;
}) {
  return (
    <div className={`statement-row${total ? " total" : ""}`}>
      <span className="k">{k}</span>
      <span className={`v${good ? " good" : ""}`}>{v}</span>
    </div>
  );
}

/** Signature element: tonal payment-composition bar with an integrated
 *  dot / label / value legend below it — the site's signature moment. */
export function CompositionBar({
  segments,
}: {
  segments: { label: string; valueFmt: string; valueC: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.valueC, 0);
  if (total <= 0) return null;
  const visible = segments.filter((s) => s.valueC > 0);
  return (
    <div className="composition">
      <div
        className="composition-bar"
        role="img"
        aria-label={visible.map((s) => `${s.label} ${Math.round((s.valueC / total) * 100)}%`).join(", ")}
      >
        {visible.map((s) => (
          <span key={s.label} style={{ width: `${(s.valueC / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="composition-legend">
        {visible.map((s) => (
          <div className="row" key={s.label}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <span className="dot" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="v">{s.valueFmt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShareButtons({ shareUrl }: { shareUrl: string }) {
  return (
    <div className="btn-row">
      <button
        className="btn primary"
        onClick={() => {
          navigator.clipboard?.writeText(shareUrl).catch(() => {});
        }}
      >
        Copy shareable link
      </button>
      <button className="btn" onClick={() => window.print()}>
        Print / save PDF
      </button>
    </div>
  );
}


/** Discrete labeled slider for the rent-vs-buy preference layer: a fixed
 *  step range with the current step's plain-English meaning shown live. */
export function DiscreteSlider({
  label,
  value,
  onChange,
  min,
  max,
  leftLabel,
  rightLabel,
  wording,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  leftLabel: string;
  rightLabel: string;
  wording: string;
}) {
  return (
    <div className="field slider-field">
      <label>
        <span>{label}</span>
      </label>
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={wording}
      />
      <div className="slider-scale">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="slider-value" aria-live="polite">{wording}</div>
    </div>
  );
}
