import { ImageResponse } from "next/og";
import { amortize, toCents } from "@/lib/finance";
import { fmtC, fmtCents } from "@/lib/format";

export const alt = "Mortgage payment breakdown";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AMOUNTS = [
  100000, 150000, 200000, 250000, 275000, 300000, 325000, 350000, 375000,
  400000, 425000, 450000, 475000, 500000, 550000, 600000, 650000, 700000,
  750000, 800000, 900000, 1000000,
];

function parseAmount(slug: string): number | null {
  const m = slug.match(/^(\d+)-mortgage-payment$/);
  if (!m) return null;
  const amount = Number(m[1]);
  return AMOUNTS.includes(amount) ? amount : null;
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ slug: `${a}-mortgage-payment` }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const amount = parseAmount(params.slug) ?? 400000;
  const label = fmtC(toCents(amount));
  const ref30 = amortize(amount, 6.5, 360);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0d1b2a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#8aa5bc" }}>UrCalc · Mortgage Calculator</div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#f9f8f5", marginTop: 20 }}>
          {label} mortgage
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#f9f8f5", marginTop: 24 }}>
          ~{fmtCents(ref30.paymentC)} / month
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8aa5bc", marginTop: 8 }}>
          Principal &amp; interest at 6.5%, 30-year term
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 56 }}>
          <div style={{ display: "flex", width: 54, height: 6, borderRadius: 3, background: "#059669" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#f9f8f5" }}>urcalc.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
