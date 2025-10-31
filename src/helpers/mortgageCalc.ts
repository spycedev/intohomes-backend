interface MortgageParams {
  price: number;
  downPaymentPercent: number;
  interestRate?: number; // actual annual rate in percent
  years?: number[]; // amortization years array
  stressTestRate?: number; // optionally specify, otherwise calculated
  propertyClass?: string | undefined;
  propertyType?: string | undefined;
  isFirstTimeHomeBuyer?: boolean; // determines max amortization period
}

interface MortgageResult {
  years: number;
  monthly: number;
  biWeekly: number;
  total: number;
  stressMonthly: number;
  stressBiWeekly: number;
  stressTotal: number;
}

export function calculateMortgage({
  price,
  downPaymentPercent,
  interestRate = 6.5,
  years,
  stressTestRate,
  propertyClass,
  propertyType,

  isFirstTimeHomeBuyer = true,
}: MortgageParams): {
  downPayment: number;
  requiredDownPayment: number;
  actualDownPaymentPercent: number;
  principal: number;
  interestRate: number;
  stressTestRate: number;
  terms: MortgageResult[];
} | null {
  if (
    propertyClass === "CommercialProperty" ||
    propertyType === "CommercialProperty"
  ) {
    return null;
  }

  // Set default years based on first-time home buyer status if not provided
  if (!years) {
    years = isFirstTimeHomeBuyer ? [5, 10, 20, 25, 30] : [5, 10, 20, 25];
  }

  // Determine minimum required down payment per Canadian rules
  let requiredDP = 0;

  // Vacant Land requires 50% down payment
  if (propertyType === "Vacant Land") {
    requiredDP = 0.5 * price;
  } else if (price > 1_250_000) {
    // Properties over $1.25M require minimum 20% down
    requiredDP = 0.2 * price;
  } else if (price <= 500_000) {
    requiredDP = 0.05 * price;
  } else if (price <= 1_500_000) {
    requiredDP = 0.05 * 500_000 + 0.1 * (price - 500_000);
  } else {
    requiredDP = 0.2 * price;
  }

  let downPayment = price * (downPaymentPercent / 100);
  let actualDownPaymentPercent = downPaymentPercent;

  // If down payment is insufficient, use the minimum required
  if (downPayment < requiredDP) {
    downPayment = requiredDP;
    actualDownPaymentPercent = (requiredDP / price) * 100;
  }

  const principal = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;

  // Determine stress test rate: contract rate + 2% for simplicity
  const computedStressRate =
    stressTestRate !== undefined ? stressTestRate : interestRate + 2;

  const terms = years.map((termYears) => {
    const n = termYears * 12;

    const monthly =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);
    const biWeekly = (monthly * 12) / 26;
    const total = monthly * n;

    const stressMonthlyRate = computedStressRate / 100 / 12;
    const stressMonthly =
      (principal * stressMonthlyRate * Math.pow(1 + stressMonthlyRate, n)) /
      (Math.pow(1 + stressMonthlyRate, n) - 1);
    const stressBiWeekly = (stressMonthly * 12) / 26;
    const stressTotal = stressMonthly * n;

    return {
      years: termYears,
      monthly,
      biWeekly,
      total,
      stressMonthly,
      stressBiWeekly,
      stressTotal,
    };
  });

  return {
    downPayment,
    requiredDownPayment: requiredDP,
    actualDownPaymentPercent,
    principal,
    interestRate,
    stressTestRate: computedStressRate,
    terms,
  };
}

// // Calculate if a property is affordable based on income
// export function isPropertyAffordable(
//   price: number,
//   annualIncome: number,
//   downPaymentPercent: number = 5,
//   propertyType: string,
//   propertyClass: string,
//   isFirstTimeHomeBuyer: boolean = true
// ) {
//   if (propertyType === "CommercialProperty") {
//     return null;
//   }
//   // Using 39% rule for monthly housing payments
//   const maxMonthlyPayment = (annualIncome / 12) * 0.39;

//   // Use appropriate amortization period based on first-time buyer status
//   const amortizationYears = isFirstTimeHomeBuyer ? 30 : 25;

//   const mortgage = calculateMortgage({
//     price,
//     downPaymentPercent,
//     interestRate: 4.3,
//     years: [amortizationYears],
//     isFirstTimeHomeBuyer,
//     propertyClass,
//     propertyType,
//   });

//   return mortgage && mortgage.terms[0].monthly <= maxMonthlyPayment;
// }

// Calculate mortgages for multiple down payment percentages and filter duplicates
export function calculateMultipleMortgages({
  price,
  downPaymentPercentages,
  interestRate = 4.3,
  propertyClass,
  propertyType,
  isFirstTimeHomeBuyer = true,
}: {
  price: number;
  downPaymentPercentages: number[];
  interestRate?: number;
  propertyClass?: string;
  propertyType?: string;
  isFirstTimeHomeBuyer?: boolean;
}) {
  const mortgages = downPaymentPercentages
    .map((downPaymentPercent) => {
      return calculateMortgage({
        price,
        downPaymentPercent,
        interestRate,
        propertyClass,
        propertyType,
        isFirstTimeHomeBuyer,
      });
    })
    .filter((mortgage) => mortgage !== null);

  // Filter out duplicates by actualDownPaymentPercent
  const uniqueMortgages = mortgages.filter((mortgage, index, self) => {
    return (
      self.findIndex(
        (m) =>
          m?.actualDownPaymentPercent === mortgage?.actualDownPaymentPercent
      ) === index
    );
  });

  return uniqueMortgages;
}
