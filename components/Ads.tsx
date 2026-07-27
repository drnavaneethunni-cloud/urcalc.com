"use client";

import { useEffect, useState } from "react";
import { ADSENSE_CLIENT_ID, CONSENT_KEY } from "@/lib/adsConfig";

/** A single display ad slot. Renders nothing if AdSense isn't configured yet. */
export function AdUnit({ slot, format = "auto" }: { slot: string; format?: string }) {
  useEffect(() => {
    if (!ADSENSE_CLIENT_ID) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the external script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ad blocker or script not yet loaded — fail silently
    }
  }, []);

  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", margin: "28px 0" }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

/** Simple consent banner for UK/EU visitors. Ads for everyone else load without a prompt. */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID) return;
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (!saved) setVisible(true);
    } catch {
      // ignore
    }
  }, []);

  if (!ADSENSE_CLIENT_ID || !visible) return null;

  function choose(value: "granted" | "denied") {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignore
    }
    // @ts-expect-error gtag is injected by the inline script above
    if (typeof window.gtag === "function") {
      // @ts-expect-error same as above
      window.gtag("consent", "update", {
        ad_storage: value,
        ad_user_data: value,
        ad_personalization: value,
        analytics_storage: value,
      });
    }
    setVisible(false);
  }

  return (
    <div className="consent-banner">
      <div className="container consent-inner">
        <p>
          We use cookies to support ads that keep UrCalc free. Calculators themselves never
          send your numbers anywhere — this is only about ad personalization.
        </p>
        <div className="consent-actions">
          <button className="btn" onClick={() => choose("denied")}>Decline</button>
          <button className="btn primary" onClick={() => choose("granted")}>Accept</button>
        </div>
      </div>
    </div>
  );
}
