"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrency, CURRENCIES } from "./CurrencyProvider";

export function HeaderActions() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { currency, setCurrency } = useCurrency();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="header-actions" style={{ width: 120, height: 36 }} />;
  }

  return (
    <div className="header-actions">
      <select
        value={currency.code}
        onChange={(e) => {
          const c = CURRENCIES.find((x) => x.code === e.target.value);
          if (c) setCurrency(c);
        }}
        style={{
          background: "var(--card-solid)",
          color: "var(--ink)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
        }}
        aria-label="Select currency"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="icon-btn"
        aria-label="Toggle dark mode"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
