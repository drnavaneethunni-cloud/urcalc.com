"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * Falls back to this hardcoded publisher ID if NEXT_PUBLIC_ADSENSE_CLIENT_ID isn't set
 * in Vercel env vars. AdSense publisher IDs are public by design (visible in every
 * AdSense site's page source), so hardcoding here is safe.
 */
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-7705620892854606";

const CONSENT_KEY = "urcalc-ad-consent"; // "granted" | "denied"

/** Loads the AdSense library and sets up Google Consent Mode v2 with EU/UK defaults denied. */
export function AdsenseScript() {
  if (!ADSENSE_CLIENT_ID) return null;
  return (
    <>
      <Script id="consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            regions: ['GB','EU']
          });
          try {
            var saved = localStorage.getItem('${CONSENT_KEY}');
            if (saved === 'granted') {
              gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted'
              });
            }
          } catch (e) {}
        `}
      </Script>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}

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
