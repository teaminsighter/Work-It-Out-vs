/**
 * Statistical Analysis Service for A/B Testing
 * Provides statistical calculations for conversion rate optimization
 */

export interface StatisticalResult {
  conversionRateA: number;
  conversionRateB: number;
  improvement: number;
  improvementPercent: number;
  confidenceLevel: number;
  isSignificant: boolean;
  pValue: number;
  zScore: number;
  marginOfError: number;
  sampleSizeA: number;
  sampleSizeB: number;
  conversionsA: number;
  conversionsB: number;
}

export interface BayesianResult extends StatisticalResult {
  probabilityBBeatsA: number;
  expectedLoss: number;
  credibleInterval: {
    lower: number;
    upper: number;
  };
}

export class StatisticsService {
  /**
   * Calculate statistical significance between two conversion rates
   * Uses Z-test for proportions
   */
  static calculateSignificance(
    conversionsA: number,
    visitsA: number,
    conversionsB: number,
    visitsB: number,
    confidenceLevel: number = 95
  ): StatisticalResult {
    // Conversion rates
    const conversionRateA = conversionsA / visitsA;
    const conversionRateB = conversionsB / visitsB;
    
    // Pooled standard error for Z-test
    const pooledRate = (conversionsA + conversionsB) / (visitsA + visitsB);
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / visitsA + 1 / visitsB)
    );
    
    // Z-score calculation
    const zScore = (conversionRateB - conversionRateA) / standardError;
    
    // P-value (two-tailed test)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    // Critical value for confidence level
    const alpha = (100 - confidenceLevel) / 100;
    const criticalValue = this.inverseMormalCDF(1 - alpha / 2);
    
    // Statistical significance
    const isSignificant = Math.abs(zScore) > criticalValue;
    
    // Improvement calculations
    const improvement = conversionRateB - conversionRateA;
    const improvementPercent = ((conversionRateB / conversionRateA) - 1) * 100;
    
    // Margin of error
    const marginOfError = criticalValue * Math.sqrt(
      (conversionRateB * (1 - conversionRateB) / visitsB) +
      (conversionRateA * (1 - conversionRateA) / visitsA)
    );

    return {
      conversionRateA,
      conversionRateB,
      improvement,
      improvementPercent: isFinite(improvementPercent) ? improvementPercent : 0,
      confidenceLevel,
      isSignificant,
      pValue,
      zScore,
      marginOfError,
      sampleSizeA: visitsA,
      sampleSizeB: visitsB,
      conversionsA,
      conversionsB
    };
  }

  /**
   * Calculate required sample size for desired statistical power
   */
  static calculateSampleSize(
    baselineRate: number,
    minimumDetectableEffect: number,
    confidenceLevel: number = 95,
    statisticalPower: number = 80
  ): number {
    const alpha = (100 - confidenceLevel) / 100;
    const beta = (100 - statisticalPower) / 100;
    
    const zAlpha = this.inverseMormalCDF(1 - alpha / 2);
    const zBeta = this.inverseMormalCDF(1 - beta);
    
    const p1 = baselineRate;
    const p2 = baselineRate * (1 + minimumDetectableEffect);
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
    const denominator = Math.pow(p2 - p1, 2);
    
    return Math.ceil(numerator / denominator);
  }

  /**
   * Bayesian analysis for A/B testing
   * Uses Beta distribution for conversion rate estimation
   */
  static calculateBayesianAnalysis(
    conversionsA: number,
    visitsA: number,
    conversionsB: number,
    visitsB: number,
    confidenceLevel: number = 95
  ): BayesianResult {
    // Get frequentist results first
    const frequentistResult = this.calculateSignificance(
      conversionsA, visitsA, conversionsB, visitsB, confidenceLevel
    );

    // Beta distribution parameters (using Jeffrey's prior: Beta(0.5, 0.5))
    const alphaA = conversionsA + 0.5;
    const betaA = visitsA - conversionsA + 0.5;
    const alphaB = conversionsB + 0.5;
    const betaB = visitsB - conversionsB + 0.5;

    // Monte Carlo simulation for probability B beats A
    const simulations = 10000;
    let bBeatsACount = 0;
    let expectedLossSum = 0;

    for (let i = 0; i < simulations; i++) {
      const sampleA = this.betaRandom(alphaA, betaA);
      const sampleB = this.betaRandom(alphaB, betaB);
      
      if (sampleB > sampleA) {
        bBeatsACount++;
        expectedLossSum += sampleB - sampleA;
      } else {
        expectedLossSum += sampleA - sampleB;
      }
    }

    const probabilityBBeatsA = bBeatsACount / simulations;
    const expectedLoss = expectedLossSum / simulations;

    // Credible interval for the difference
    const credibleInterval = this.calculateCredibleInterval(
      alphaA, betaA, alphaB, betaB, confidenceLevel
    );

    return {
      ...frequentistResult,
      probabilityBBeatsA,
      expectedLoss,
      credibleInterval
    };
  }

  /**
   * Calculate sequential testing stopping criteria
   * Implements Sequential Probability Ratio Test (SPRT)
   */
  static calculateSequentialTest(
    conversionsA: number,
    visitsA: number,
    conversionsB: number,
    visitsB: number,
    alpha: number = 0.05,
    beta: number = 0.2,
    minimumEffect: number = 0.1
  ): {
    shouldStop: boolean;
    decision: 'continue' | 'stop_A_wins' | 'stop_B_wins' | 'stop_inconclusive';
    logLikelihoodRatio: number;
    upperBoundary: number;
    lowerBoundary: number;
  } {
    const p0 = conversionsA / visitsA; // Null hypothesis rate
    const p1 = p0 * (1 + minimumEffect); // Alternative hypothesis rate

    // Calculate log likelihood ratio
    const logLR = conversionsB * Math.log(p1 / p0) + 
                  (visitsB - conversionsB) * Math.log((1 - p1) / (1 - p0));

    // SPRT boundaries
    const upperBoundary = Math.log((1 - beta) / alpha);
    const lowerBoundary = Math.log(beta / (1 - alpha));

    let shouldStop = false;
    let decision: 'continue' | 'stop_A_wins' | 'stop_B_wins' | 'stop_inconclusive' = 'continue';

    if (logLR >= upperBoundary) {
      shouldStop = true;
      decision = 'stop_B_wins';
    } else if (logLR <= lowerBoundary) {
      shouldStop = true;
      decision = 'stop_A_wins';
    }

    return {
      shouldStop,
      decision,
      logLikelihoodRatio: logLR,
      upperBoundary,
      lowerBoundary
    };
  }

  /**
   * Calculate confidence intervals for conversion rates
   */
  static calculateConfidenceInterval(
    conversions: number,
    visits: number,
    confidenceLevel: number = 95
  ): { lower: number; upper: number } {
    const rate = conversions / visits;
    const alpha = (100 - confidenceLevel) / 100;
    const zScore = this.inverseMormalCDF(1 - alpha / 2);
    
    const standardError = Math.sqrt((rate * (1 - rate)) / visits);
    const margin = zScore * standardError;
    
    return {
      lower: Math.max(0, rate - margin),
      upper: Math.min(1, rate + margin)
    };
  }

  /**
   * Normal cumulative distribution function
   */
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Inverse normal cumulative distribution function (approximation)
   */
  private static inverseMormalCDF(p: number): number {
    // Rational approximation for inverse normal CDF
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    // Coefficients for the approximation
    const c = [2.515517, 0.802853, 0.010328];
    const d = [1.432788, 0.189269, 0.001308];

    if (p > 0.5) {
      const t = Math.sqrt(-2 * Math.log(1 - p));
      return t - (c[0] + c[1] * t + c[2] * t * t) / (1 + d[0] * t + d[1] * t * t + d[2] * t * t * t);
    } else {
      const t = Math.sqrt(-2 * Math.log(p));
      return -(t - (c[0] + c[1] * t + c[2] * t * t) / (1 + d[0] * t + d[1] * t * t + d[2] * t * t * t));
    }
  }

  /**
   * Error function approximation
   */
  private static erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Generate random sample from Beta distribution
   */
  private static betaRandom(alpha: number, beta: number): number {
    const gamma1 = this.gammaRandom(alpha);
    const gamma2 = this.gammaRandom(beta);
    return gamma1 / (gamma1 + gamma2);
  }

  /**
   * Generate random sample from Gamma distribution
   */
  private static gammaRandom(shape: number): number {
    // Marsaglia and Tsang's method
    if (shape < 1) {
      return this.gammaRandom(shape + 1) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x, v;
      do {
        x = this.normalRandom();
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = Math.random();

      if (u < 1 - 0.331 * x * x * x * x) {
        return d * v;
      }

      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v;
      }
    }
  }

  /**
   * Generate random sample from standard normal distribution
   */
  private static normalRandom(): number {
    // Box-Muller transformation
    if (this.normalCache !== null) {
      const result = this.normalCache;
      this.normalCache = null;
      return result;
    }

    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    this.normalCache = Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v);
    
    return z;
  }

  private static normalCache: number | null = null;

  /**
   * Calculate credible interval for difference between two Beta distributions
   */
  private static calculateCredibleInterval(
    alphaA: number,
    betaA: number,
    alphaB: number,
    betaB: number,
    confidenceLevel: number
  ): { lower: number; upper: number } {
    const simulations = 10000;
    const differences: number[] = [];

    for (let i = 0; i < simulations; i++) {
      const sampleA = this.betaRandom(alphaA, betaA);
      const sampleB = this.betaRandom(alphaB, betaB);
      differences.push(sampleB - sampleA);
    }

    differences.sort((a, b) => a - b);
    
    const alpha = (100 - confidenceLevel) / 100;
    const lowerIndex = Math.floor((alpha / 2) * simulations);
    const upperIndex = Math.floor((1 - alpha / 2) * simulations);

    return {
      lower: differences[lowerIndex],
      upper: differences[upperIndex]
    };
  }
}