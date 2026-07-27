/**
 * Falls back to this hardcoded publisher ID if NEXT_PUBLIC_ADSENSE_CLIENT_ID isn't set
 * in Vercel env vars. AdSense publisher IDs are public by design (visible in every
 * AdSense site's page source), so hardcoding here is safe.
 */
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-7705620892854606";

export const CONSENT_KEY = "urcalc-ad-consent"; // "granted" | "denied"

export const CONSENT_DEFAULT_SCRIPT = `
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
`;
