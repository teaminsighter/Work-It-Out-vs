interface SolarQuote {
  systemSize: number;
  panelCount: number;
  annualSavings: number;
  paybackPeriod: number;
  co2Reduction: number;
  systemCost: number;
  incentives: number;
}

export function calculateSolarQuote(formData: Record<string, any>): SolarQuote {
  // Base calculations based on typical Irish solar installations
  let systemSize = 4; // Default 4kW system
  let annualSavings = 600; // Default annual savings
  let systemCost = 8000; // Base system cost
  
  // Adjust based on current bill
  const billRange = formData['current-bill'];
  switch (billRange) {
    case 'under-300':
      systemSize = 3;
      annualSavings = 400;
      systemCost = 6500;
      break;
    case '300-500':
      systemSize = 4;
      annualSavings = 600;
      systemCost = 8000;
      break;
    case '500-800':
      systemSize = 6;
      annualSavings = 900;
      systemCost = 11000;
      break;
    case '800-1200':
      systemSize = 8;
      annualSavings = 1200;
      systemCost = 14000;
      break;
    case 'over-1200':
      systemSize = 10;
      annualSavings = 1500;
      systemCost = 17000;
      break;
  }

  // Adjust for energy usage pattern
  const energyUsage = formData['energy-usage'];
  if (energyUsage === 'day') {
    // Better solar utilization
    annualSavings *= 1.2;
  } else if (energyUsage === 'night') {
    // Poor solar utilization without battery
    annualSavings *= 0.7;
  }

  // Adjust for battery storage interest
  const batteryInterest = formData['battery-interest'];
  if (batteryInterest === 'yes') {
    systemCost += 4000; // Add battery cost
    annualSavings *= 1.4; // Increase savings with battery
  } else if (batteryInterest === 'future') {
    systemCost += 500; // Battery-ready inverter
  }

  // Adjust for roof condition
  const roofCondition = formData['roof-condition'];
  if (roofCondition === 'poor') {
    systemCost += 2000; // Additional roof work needed
  } else if (roofCondition === 'excellent') {
    systemCost -= 500; // Easier installation
  }

  // Calculate derived values
  const panelCount = Math.ceil(systemSize / 0.4); // Assuming 400W panels
  const paybackPeriod = Math.round((systemCost - 2400) / annualSavings * 10) / 10; // Minus SEAI grant
  const co2Reduction = Math.round(systemSize * 300); // Approx 300kg CO2 per kW per year
  const incentives = Math.min(2400, systemSize * 300); // SEAI grant up to €2400

  return {
    systemSize: Math.round(systemSize * 10) / 10,
    panelCount,
    annualSavings: Math.round(annualSavings),
    paybackPeriod: Math.max(1, paybackPeriod),
    co2Reduction,
    systemCost: Math.round(systemCost),
    incentives
  };
}