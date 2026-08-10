import type { Metadata } from "next";
import Link from "next/link";
import BmiCalc from "@/components/BmiCalc";
import { JsonLd, calculatorSchema, breadcrumbSchema, Disclaimer } from "@/components/seo";

export const metadata: Metadata = {
  title: "BMI Calculator | Check Your Body Mass Index",
  description:
    "Free BMI calculator. Calculate your Body Mass Index to find out if you are at a healthy weight.",
  alternates: { canonical: "/bmi-calculator" },
};

export default function Page() {
  return (
    <div className="container">
      <JsonLd
        data={calculatorSchema(
          "BMI Calculator",
          "Free Body Mass Index (BMI) calculator to assess healthy weight.",
          "/bmi-calculator"
        )}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "BMI Calculator", path: "/bmi-calculator" }])} />
      <div style={{ paddingTop: 32 }}>
        <div className="eyebrow">Health</div>
        <h1>BMI Calculator</h1>
        <p className="lede">
          Calculate your Body Mass Index (BMI) to see if you are in a healthy weight range based on your height and weight.
        </p>
      </div>

      <BmiCalc />

      <div className="prose">
        <h2>What is BMI?</h2>
        <p>
          Body Mass Index (BMI) is a simple index of weight-for-height that is commonly used to classify underweight, overweight and obesity in adults. It is defined as the weight in kilograms divided by the square of the height in meters (kg/m²).
        </p>
        
        <h3>Limitations of BMI</h3>
        <p>
          While BMI is a useful screening tool, it does not directly measure body fat. Athletes with high muscle mass might have a high BMI despite having low body fat percentages. It is always best to consult with a healthcare provider for a comprehensive health assessment.
        </p>
      </div>

      <Disclaimer />
    </div>
  );
}
