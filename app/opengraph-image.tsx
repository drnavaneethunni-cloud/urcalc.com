import { ImageResponse } from "next/og";

export const alt = "UrCalc — Free Mortgage, Auto & Personal Loan Calculators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            <div style={{ width: 16, height: 26, borderRadius: 6, background: "#f9f8f5" }} />
            <div style={{ width: 16, height: 46, borderRadius: 6, background: "#f9f8f5" }} />
            <div style={{ width: 16, height: 68, borderRadius: 6, background: "#f9f8f5" }} />
            <div style={{ width: 16, height: 90, borderRadius: 6, background: "#f9f8f5" }} />
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#f9f8f5" }}>
            UrCalc
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 58,
            fontWeight: 700,
            color: "#f9f8f5",
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          Calculate any loan. Understand every payment.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#8aa5bc",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          Free mortgage, auto &amp; personal loan calculators — accurate to the cent.
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
