import type { MetadataRoute } from "next";
import { SITE } from "@/components/seo";

const AMOUNTS = [
  100000, 150000, 200000, 250000, 275000, 300000, 325000, 350000, 375000,
  400000, 425000, 450000, 475000, 500000, 550000, 600000, 650000, 700000,
  750000, 800000, 900000, 1000000,
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const core = ["", "/mortgage-calculator", "/auto-loan-calculator", "/personal-loan-calculator", "/affordability-calculator"].map(
    (p) => ({
      url: `${SITE}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.9,
    })
  );
  const programmatic = AMOUNTS.map((a) => ({
    url: `${SITE}/mortgage/${a}-mortgage-payment`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...core, ...programmatic];
}
