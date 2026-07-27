import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How UrCalc handles data: what we collect, what we don't, and how advertising cookies work on this site.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicy() {
  return (
    <div className="container prose" style={{ padding: "48px 0 64px" }}>
      <h1>Privacy Policy</h1>
      <p className="note">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2>The short version</h2>
      <p>
        Every calculator on UrCalc runs entirely in your browser. The numbers you type in —
        loan amounts, rates, income, anything — are never sent to our servers, never stored,
        and never seen by us. We don't require an account and we don't ask for your name,
        email, or financial details to use any calculator.
      </p>

      <h2>What we do collect</h2>
      <p>
        Like most websites, we use standard analytics to understand how many people visit,
        which pages are popular, and whether pages load quickly. This is aggregate, anonymized
        traffic data — it doesn't include anything you type into a calculator.
      </p>
      <p>
        If advertising is enabled on this site, our advertising partner (Google AdSense) may
        set cookies or use similar technologies to show relevant ads and measure ad
        performance. This can include information such as your approximate location (city or
        region level), browser type, and pages viewed. Google's own privacy policy governs how
        that data is used: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.
      </p>

      <h2>Your choices</h2>
      <p>
        Visitors in the UK and EU see a consent banner before any advertising cookies are set,
        and can decline. You can also opt out of personalized advertising generally at{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>{" "}
        or by adjusting your browser's cookie settings at any time.
      </p>

      <h2>Cookies</h2>
      <p>
        Beyond the advertising cookies described above, we may use a single local storage
        entry to remember your consent choice so we don't ask again on every visit. This is
        stored in your browser only, not on our servers.
      </p>

      <h2>Children's privacy</h2>
      <p>
        UrCalc is not directed at children under 13, and we do not knowingly collect
        information from them.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If this policy changes, we'll update the date at the top of this page. Continued use
        of the site after changes means you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or your data can be sent to the contact address listed on
        our site.
      </p>
    </div>
  );
}
