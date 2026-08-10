"use client";

import { useState } from "react";
import { calculateBmi } from "@/lib/health";
import { NumField } from "./ui";

export default function BmiCalc() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);

  const res = calculateBmi(weight, height);

  let categoryColor = "var(--accent)";
  if (res.category === "Underweight") categoryColor = "var(--interest)";
  else if (res.category === "Overweight") categoryColor = "var(--interest)";
  else if (res.category === "Obese") categoryColor = "var(--danger)";

  return (
    <div className="calc-grid">
      <div className="calc-inputs">
        <div className="panel">
          <NumField label="Weight (kg)" value={weight} onChange={setWeight} />
          <NumField label="Height (cm)" value={height} onChange={setHeight} />
        </div>
      </div>

      <div className="calc-results">
        <div className="panel">
          <div className="headline-figure">
            <div className="label">Your BMI</div>
            <div className="value">{res.bmi > 0 ? res.bmi.toFixed(1) : "0"}</div>
          </div>
          
          <div className="statement">
            <div className="statement-row">
              <span className="k">Category</span>
              <span className="v" style={{ color: categoryColor, fontWeight: 700 }}>{res.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
