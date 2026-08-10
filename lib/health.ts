export interface BmiResult {
  bmi: number;
  category: string;
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  if (weightKg <= 0 || heightCm <= 0) return { bmi: 0, category: "Invalid" };
  
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  let category = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi >= 25 && bmi < 30) category = "Overweight";
  else if (bmi >= 30) category = "Obese";
  
  return { bmi, category };
}
