"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fmtC: (cents: number) => string;
  fmtCents: (cents: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("urcalc_currency");
    if (stored) {
      const found = CURRENCIES.find((c) => c.code === stored);
      if (found) setCurrencyState(found);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("urcalc_currency", c.code);
  };

  const formatters = useMemo(() => {
    const localeMap: Record<string, string> = {
      USD: "en-US",
      EUR: "de-DE",
      GBP: "en-GB",
      INR: "en-IN",
      CAD: "en-CA",
      AUD: "en-AU",
      JPY: "ja-JP",
    };
    const locale = localeMap[currency.code] || "en-US";

    const whole = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 0,
    });

    const exact = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return {
      fmtC: (cents: number) => whole.format(Math.round(cents / 100)),
      fmtCents: (cents: number) => exact.format(cents / 100),
    };
  }, [currency]);

  // Prevent hydration mismatch by using empty formatters on server
  const value = useMemo(() => {
    if (!mounted) {
      return {
        currency: CURRENCIES[0],
        setCurrency,
        fmtC: (c: number) => `$${Math.round(c/100).toLocaleString("en-US")}`,
        fmtCents: (c: number) => `$${(c/100).toLocaleString("en-US", {minimumFractionDigits: 2})}`,
      };
    }
    return {
      currency,
      setCurrency,
      ...formatters,
    };
  }, [mounted, currency, formatters]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
