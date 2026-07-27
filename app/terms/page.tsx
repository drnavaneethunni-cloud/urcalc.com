import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using UrCalc's free loan calculators.",
  robots: { index: true, follow: true },
};

export default function Terms() {
  return (
    <div className="container prose" style={{ padding: "48px 0 64px" }}>
      <h1>Terms of Service</h1>
      <p className="note">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2>What UrCalc is</h2>
      <p>
        UrCalc provides free, browser-based calculators for mortgage, auto loan, and personal
        loan payments. By using this site, you agree to these terms.
      </p>

      <h2>Not financial advice</h2>
      <p>
        Every figure on this site is an educational estimate, not financial, tax, or lending
        advice. Actual rates, payments, taxes, insurance, and fees vary by lender, credit
        profile, and location. Always confirm final numbers with your lender or a licensed
        financial advisor before making a decision based on anything calculated here.
      </p>

      <h2>No warranty</h2>
      <p>
        UrCalc is provided "as is," without warranty of any kind. While we test our formulas
        carefully, we don't guarantee the calculators are error-free, uninterrupted, or fit for
        any particular purpose.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, UrCalc and its operators are not liable for
        any financial decision made using this site, or for any direct, indirect, or
        consequential loss arising from its use.
      </p>

      <h2>Advertising</h2>
      <p>
        This site may display advertising served by third parties, including Google AdSense.
        We don't control the content of individual ads. See our{" "}
        <a href="/privacy-policy">Privacy Policy</a> for details on how advertising cookies
        work.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the site — including attempting to disrupt its operation,
        scrape it at abusive volume, or use it for any unlawful purpose.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the site after changes
        means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>Questions about these terms can be sent to the contact address listed on our site.</p>
    </div>
  );
}
