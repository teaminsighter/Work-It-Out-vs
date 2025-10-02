/**
 * A/B Testing Service
 * Handles test assignment, visitor tracking, and conversion management
 * Implements A-B-A-B sequential assignment pattern
 */

import { PrismaClient } from '@prisma/client';
import { StatisticsService, StatisticalResult } from './statisticsService';

const prisma = new PrismaClient();

export interface VisitorInfo {
  visitorUserId: string;
  ipAddress?: string;
  userAgent?: string;
  page: string;
}

export interface TestAssignment {
  testId: string;
  variant: 'A' | 'B';
  isNewAssignment: boolean;
  landingPageContent: any;
}

export interface ConversionData {
  testId: string;
  visitorUserId: string;
  conversionValue?: number;
  leadId?: string;
}

export interface TestResults {
  test: any;
  statistics: StatisticalResult;
  assignments: {
    totalA: number;
    totalB: number;
    conversionsA: number;
    conversionsB: number;
  };
  recommendations: {
    shouldStop: boolean;
    winner?: 'A' | 'B';
    confidence: number;
    reason: string;
  };
}

export class ABTestingService {
  /**
   * Assign visitor to A/B test variant using A-B-A-B pattern
   */
  static async assignVisitorToTest(
    testId: string,
    visitorInfo: VisitorInfo
  ): Promise<TestAssignment | null> {
    try {
      // Check if test exists and is active
      const test = await prisma.aBTest.findUnique({
        where: { id: testId }
      });

      if (!test || test.status !== 'ACTIVE') {
        return null;
      }

      // Check if visitor already has an assignment
      const existingAssignment = await prisma.aBTestAssignment.findUnique({
        where: { 
          testId_visitorUserId: {
            testId,
            visitorUserId: visitorInfo.visitorUserId
          }
        }
      });

      if (existingAssignment) {
        // Return existing assignment
        const landingPageContent = existingAssignment.variant === 'A' 
          ? test.landingPageA 
          : test.landingPageB;

        return {
          testId,
          variant: existingAssignment.variant,
          isNewAssignment: false,
          landingPageContent
        };
      }

      // Determine variant based on assignment strategy
      let variant: 'A' | 'B';

      switch (test.assignmentType) {
        case 'ALTERNATING':
          variant = await this.getAlternatingAssignment(testId);
          break;
        case 'FIFTY_FIFTY':
          variant = Math.random() < 0.5 ? 'A' : 'B';
          break;
        case 'CUSTOM_SPLIT':
          const customProbability = test.customSplitA / 100;
          variant = Math.random() < customProbability ? 'A' : 'B';
          break;
        default:
          variant = 'A';
      }

      // Create new assignment
      const assignment = await prisma.aBTestAssignment.create({
        data: {
          testId,
          visitorUserId: visitorInfo.visitorUserId,
          variant,
          ipAddress: visitorInfo.ipAddress,
          userAgent: visitorInfo.userAgent
        }
      });

      // Update test visit counts
      await this.updateTestVisitCounts(testId, variant);

      // Get landing page content
      const landingPageContent = variant === 'A' 
        ? test.landingPageA 
        : test.landingPageB;

      return {
        testId,
        variant: assignment.variant,
        isNewAssignment: true,
        landingPageContent
      };

    } catch (error) {
      console.error('Error assigning visitor to test:', error);
      return null;
    }
  }

  /**
   * Implement A-B-A-B alternating assignment pattern
   */
  private static async getAlternatingAssignment(testId: string): Promise<'A' | 'B'> {
    // Get the count of assignments for this test
    const assignmentCount = await prisma.aBTestAssignment.count({
      where: { testId }
    });

    // A-B-A-B pattern: even indices (0,2,4...) get A, odd indices (1,3,5...) get B
    return assignmentCount % 2 === 0 ? 'A' : 'B';
  }

  /**
   * Update visit counts for the test
   */
  private static async updateTestVisitCounts(testId: string, variant: 'A' | 'B'): Promise<void> {
    const updateField = variant === 'A' ? 'visitsA' : 'visitsB';
    
    await prisma.aBTest.update({
      where: { id: testId },
      data: {
        [updateField]: {
          increment: 1
        }
      }
    });
  }

  /**
   * Record conversion for a visitor
   */
  static async recordConversion(conversionData: ConversionData): Promise<boolean> {
    try {
      // Find the assignment
      const assignment = await prisma.aBTestAssignment.findUnique({
        where: {
          testId_visitorUserId: {
            testId: conversionData.testId,
            visitorUserId: conversionData.visitorUserId
          }
        }
      });

      if (!assignment || assignment.converted) {
        return false; // No assignment found or already converted
      }

      // Update assignment with conversion
      await prisma.aBTestAssignment.update({
        where: { id: assignment.id },
        data: {
          converted: true,
          conversionAt: new Date(),
          conversionValue: conversionData.conversionValue
        }
      });

      // Update test conversion counts and rates
      await this.updateTestConversionCounts(conversionData.testId, assignment.variant);

      return true;
    } catch (error) {
      console.error('Error recording conversion:', error);
      return false;
    }
  }

  /**
   * Update conversion counts and rates for the test
   */
  private static async updateTestConversionCounts(testId: string, variant: 'A' | 'B'): Promise<void> {
    const test = await prisma.aBTest.findUnique({
      where: { id: testId }
    });

    if (!test) return;

    const conversionField = variant === 'A' ? 'conversionsA' : 'conversionsB';
    const rateField = variant === 'A' ? 'conversionRateA' : 'conversionRateB';
    const visitsField = variant === 'A' ? 'visitsA' : 'visitsB';

    // Increment conversions
    const newConversions = (variant === 'A' ? test.conversionsA : test.conversionsB) + 1;
    const visits = variant === 'A' ? test.visitsA : test.visitsB;
    const newRate = visits > 0 ? newConversions / visits : 0;

    await prisma.aBTest.update({
      where: { id: testId },
      data: {
        [conversionField]: newConversions,
        [rateField]: newRate
      }
    });

    // Check if test should be stopped based on statistical significance
    await this.checkTestCompletion(testId);
  }

  /**
   * Check if test has reached statistical significance and should be stopped
   */
  private static async checkTestCompletion(testId: string): Promise<void> {
    const test = await prisma.aBTest.findUnique({
      where: { id: testId }
    });

    if (!test || test.status !== 'ACTIVE') return;

    // Don't check until we have minimum sample size
    if (test.visitsA < 100 || test.visitsB < 100) return;

    const stats = StatisticsService.calculateSignificance(
      test.conversionsA,
      test.visitsA,
      test.conversionsB,
      test.visitsB,
      test.confidenceLevel
    );

    if (stats.isSignificant) {
      const winner = stats.conversionRateB > stats.conversionRateA ? 'B' : 'A';
      
      await prisma.aBTest.update({
        where: { id: testId },
        data: {
          status: 'COMPLETED',
          statisticalSignificance: true,
          winnerVariant: winner,
          endDate: new Date()
        }
      });
    }
  }

  /**
   * Get comprehensive test results with statistical analysis
   */
  static async getTestResults(testId: string): Promise<TestResults | null> {
    try {
      const test = await prisma.aBTest.findUnique({
        where: { id: testId },
        include: {
          assignments: true
        }
      });

      if (!test) return null;

      // Calculate statistics
      const statistics = StatisticsService.calculateSignificance(
        test.conversionsA,
        test.visitsA,
        test.conversionsB,
        test.visitsB,
        test.confidenceLevel
      );

      // Assignment breakdown
      const assignments = {
        totalA: test.visitsA,
        totalB: test.visitsB,
        conversionsA: test.conversionsA,
        conversionsB: test.conversionsB
      };

      // Generate recommendations
      const recommendations = this.generateRecommendations(test, statistics);

      return {
        test,
        statistics,
        assignments,
        recommendations
      };

    } catch (error) {
      console.error('Error getting test results:', error);
      return null;
    }
  }

  /**
   * Generate recommendations based on test results
   */
  private static generateRecommendations(test: any, stats: StatisticalResult): {
    shouldStop: boolean;
    winner?: 'A' | 'B';
    confidence: number;
    reason: string;
  } {
    const minSampleSize = 1000;
    const totalSample = test.visitsA + test.visitsB;

    // Not enough data
    if (totalSample < minSampleSize) {
      return {
        shouldStop: false,
        confidence: 0,
        reason: `Need more data. Current sample: ${totalSample}, minimum recommended: ${minSampleSize}`
      };
    }

    // Statistically significant result
    if (stats.isSignificant) {
      const winner = stats.conversionRateB > stats.conversionRateA ? 'B' : 'A';
      return {
        shouldStop: true,
        winner,
        confidence: stats.confidenceLevel,
        reason: `Statistically significant result at ${stats.confidenceLevel}% confidence. Variant ${winner} wins with ${Math.abs(stats.improvementPercent).toFixed(2)}% improvement.`
      };
    }

    // Large sample, no significance
    if (totalSample > 10000) {
      return {
        shouldStop: true,
        confidence: 0,
        reason: `Large sample size (${totalSample}) with no significant difference. Consider this a tie or implement the simpler variant.`
      };
    }

    // Continue testing
    return {
      shouldStop: false,
      confidence: 100 - (stats.pValue * 100),
      reason: `Continue testing. Current confidence: ${(100 - (stats.pValue * 100)).toFixed(1)}%, need ${stats.confidenceLevel}% for significance.`
    };
  }

  /**
   * Create a new A/B test
   */
  static async createTest(testData: {
    name: string;
    description?: string;
    url: string;
    urlMatchType?: 'EXACT' | 'PATTERN' | 'REGEX';
    assignmentType?: 'FIFTY_FIFTY' | 'ALTERNATING' | 'CUSTOM_SPLIT';
    customSplitA?: number;
    customSplitB?: number;
    landingPageA: any;
    landingPageB: any;
    confidenceLevel?: number;
    createdBy: string;
  }): Promise<string> {
    const test = await prisma.aBTest.create({
      data: {
        name: testData.name,
        description: testData.description,
        url: testData.url,
        urlMatchType: testData.urlMatchType || 'EXACT',
        assignmentType: testData.assignmentType || 'ALTERNATING',
        customSplitA: testData.customSplitA || 50,
        customSplitB: testData.customSplitB || 50,
        landingPageA: testData.landingPageA,
        landingPageB: testData.landingPageB,
        confidenceLevel: testData.confidenceLevel || 95,
        createdBy: testData.createdBy,
        status: 'DRAFT'
      }
    });

    return test.id;
  }

  /**
   * Start a test
   */
  static async startTest(testId: string): Promise<boolean> {
    try {
      await prisma.aBTest.update({
        where: { id: testId },
        data: {
          status: 'ACTIVE',
          startDate: new Date()
        }
      });
      return true;
    } catch (error) {
      console.error('Error starting test:', error);
      return false;
    }
  }

  /**
   * Stop a test
   */
  static async stopTest(testId: string, reason?: string): Promise<boolean> {
    try {
      await prisma.aBTest.update({
        where: { id: testId },
        data: {
          status: 'COMPLETED',
          endDate: new Date()
        }
      });
      return true;
    } catch (error) {
      console.error('Error stopping test:', error);
      return false;
    }
  }

  /**
   * Pause a test
   */
  static async pauseTest(testId: string): Promise<boolean> {
    try {
      await prisma.aBTest.update({
        where: { id: testId },
        data: {
          status: 'PAUSED'
        }
      });
      return true;
    } catch (error) {
      console.error('Error pausing test:', error);
      return false;
    }
  }

  /**
   * Get all tests with basic stats
   */
  static async getAllTests(): Promise<any[]> {
    return await prisma.aBTest.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
        status: true,
        visitsA: true,
        visitsB: true,
        conversionsA: true,
        conversionsB: true,
        conversionRateA: true,
        conversionRateB: true,
        statisticalSignificance: true,
        winnerVariant: true,
        startDate: true,
        endDate: true,
        createdAt: true
      }
    });
  }

  /**
   * Get visitor's current test assignments
   */
  static async getVisitorAssignments(visitorUserId: string): Promise<any[]> {
    return await prisma.aBTestAssignment.findMany({
      where: { visitorUserId },
      include: {
        test: {
          select: {
            id: true,
            name: true,
            url: true,
            status: true,
            landingPageA: true,
            landingPageB: true
          }
        }
      }
    });
  }

  /**
   * Check URL matching for test assignment
   */
  static checkUrlMatch(testUrl: string, currentUrl: string, matchType: 'EXACT' | 'PATTERN' | 'REGEX'): boolean {
    switch (matchType) {
      case 'EXACT':
        return testUrl === currentUrl;
      
      case 'PATTERN':
        // Convert wildcard pattern to regex
        const pattern = testUrl
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        return new RegExp(`^${pattern}$`).test(currentUrl);
      
      case 'REGEX':
        try {
          return new RegExp(testUrl).test(currentUrl);
        } catch {
          return false;
        }
      
      default:
        return false;
    }
  }
}

export default ABTestingService;