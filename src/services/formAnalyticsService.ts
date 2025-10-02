interface FormAnalyticsData {
  formType: string;
  totalSubmissions: number;
  completionRate: number;
  avgCompletionTime: number;
  questions: QuestionAnalytics[];
  dropOffPoints: DropOffPoint[];
  popularAnswers: PopularAnswer[];
  timeAnalytics: TimeAnalytics[];
  conversionFunnel: ConversionStep[];
}

interface QuestionAnalytics {
  id: string;
  question: string;
  type: 'multiple-choice' | 'form-fields' | 'slider';
  totalResponses: number;
  dropOffRate: number;
  avgTimeSpent: number;
  answers: AnswerDistribution[];
}

interface AnswerDistribution {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

interface DropOffPoint {
  questionId: string;
  question: string;
  dropOffCount: number;
  dropOffPercentage: number;
  stage: number;
}

interface PopularAnswer {
  question: string;
  answer: string;
  count: number;
  percentage: number;
}

interface TimeAnalytics {
  questionId: string;
  question: string;
  avgTimeSpent: number;
  minTime: number;
  maxTime: number;
}

interface ConversionStep {
  step: number;
  stepName: string;
  users: number;
  dropOff: number;
  conversionRate: number;
}

export class FormAnalyticsService {
  static async getFormAnalytics(
    formType: 'main' | 'life' | 'health' | 'income', 
    dateRange: string = '30d'
  ): Promise<FormAnalyticsData> {
    try {
      const response = await fetch(`/api/analytics/form-analytics?formType=${formType}&range=${dateRange}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch form analytics');
      }
      
      return result.data;
    } catch (error) {
      console.error('Form analytics fetch error:', error);
      
      // Return empty state for production - no mock data
      return {
        formType,
        totalSubmissions: 0,
        completionRate: 0,
        avgCompletionTime: 0,
        questions: [],
        dropOffPoints: [],
        popularAnswers: [],
        timeAnalytics: [],
        conversionFunnel: []
      };
    }
  }

  static async exportFormAnalytics(
    formType: string, 
    dateRange: string, 
    format: 'csv' | 'pdf' | 'excel' = 'csv'
  ): Promise<Blob> {
    try {
      const data = await this.getFormAnalytics(formType as any, dateRange);
      
      if (format === 'csv') {
        return this.generateCSV(data);
      }
      
      // For PDF and Excel, you'd use libraries like jsPDF or xlsx
      throw new Error(`Export format ${format} not implemented yet`);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  private static generateCSV(data: FormAnalyticsData): Blob {
    const headers = ['Question', 'Total Responses', 'Drop-off Rate', 'Avg Time (s)', 'Type'];
    const rows = data.questions.map(q => [
      q.question,
      q.totalResponses.toString(),
      q.dropOffRate.toString() + '%',
      q.avgTimeSpent.toString(),
      q.type
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}