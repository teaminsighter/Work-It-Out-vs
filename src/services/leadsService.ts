// Mock Leads Service for Admin Panel
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  contactPreference: 'email' | 'phone' | 'both';
  bestTimeToCall?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'converted' | 'not_interested';
  source: string;
  score: number;
  tags?: string[];
  notes?: LeadNote[];
  createdAt: string;
  updatedAt: string;
  systemDetails?: {
    insuranceType: string;
    coverageAmount?: number;
    premium?: number;
    estimatedValue: number;
  };
}

export interface LeadNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  conversionRate: number;
  averageScore: number;
  totalValue: number;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  minScore?: number;
  tags?: string[];
}

class LeadsService {
  private mockLeads: Lead[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+64 21 123 4567',
      contactPreference: 'phone',
      bestTimeToCall: 'Morning',
      status: 'qualified',
      source: 'Google Ads',
      score: 85,
      tags: ['health-insurance', 'high-priority'],
      createdAt: '2024-09-25T10:30:00Z',
      updatedAt: '2024-09-26T14:20:00Z',
      systemDetails: {
        insuranceType: 'Health',
        coverageAmount: 50000,
        premium: 120,
        estimatedValue: 1440
      },
      notes: [
        {
          id: 'n1',
          content: 'Interested in family health plan. Has existing coverage but looking for better deal.',
          createdAt: '2024-09-25T10:35:00Z',
          createdBy: 'Admin User'
        }
      ]
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+64 21 987 6543',
      contactPreference: 'email',
      status: 'new',
      source: 'Facebook Ads',
      score: 72,
      tags: ['life-insurance'],
      createdAt: '2024-09-26T15:45:00Z',
      updatedAt: '2024-09-26T15:45:00Z',
      systemDetails: {
        insuranceType: 'Life',
        coverageAmount: 250000,
        estimatedValue: 2400
      },
      notes: []
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Brown',
      email: 'mike.brown@email.com',
      phone: '+64 21 555 0123',
      contactPreference: 'both',
      bestTimeToCall: 'Evening',
      status: 'converted',
      source: 'Organic Search',
      score: 95,
      tags: ['income-protection', 'converted'],
      createdAt: '2024-09-20T09:15:00Z',
      updatedAt: '2024-09-28T11:30:00Z',
      systemDetails: {
        insuranceType: 'Income Protection',
        coverageAmount: 80000,
        premium: 85,
        estimatedValue: 1020
      },
      notes: [
        {
          id: 'n2',
          content: 'Converted to income protection policy. Very satisfied with service.',
          createdAt: '2024-09-28T11:30:00Z',
          createdBy: 'Sales Team'
        }
      ]
    },
    {
      id: '4',
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@email.com',
      contactPreference: 'email',
      status: 'contacted',
      source: 'Direct',
      score: 78,
      tags: ['health-insurance'],
      createdAt: '2024-09-27T13:20:00Z',
      updatedAt: '2024-09-28T09:45:00Z',
      systemDetails: {
        insuranceType: 'Health',
        coverageAmount: 75000,
        estimatedValue: 1800
      },
      notes: [
        {
          id: 'n3',
          content: 'Follow-up call scheduled for tomorrow morning.',
          createdAt: '2024-09-28T09:45:00Z',
          createdBy: 'Admin User'
        }
      ]
    }
  ];

  async getLeads(filters?: LeadFilters): Promise<Lead[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredLeads = [...this.mockLeads];

    if (filters) {
      if (filters.status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
      }
      if (filters.source) {
        filteredLeads = filteredLeads.filter(lead => lead.source === filters.source);
      }
      if (filters.minScore) {
        filteredLeads = filteredLeads.filter(lead => lead.score >= filters.minScore);
      }
      if (filters.tags && filters.tags.length > 0) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.tags?.some(tag => filters.tags!.includes(tag))
        );
      }
    }

    return filteredLeads;
  }

  async getLead(id: string): Promise<Lead | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockLeads.find(lead => lead.id === id) || null;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const leadIndex = this.mockLeads.findIndex(lead => lead.id === id);
    if (leadIndex === -1) {
      throw new Error('Lead not found');
    }

    this.mockLeads[leadIndex] = {
      ...this.mockLeads[leadIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.mockLeads[leadIndex];
  }

  async addNote(leadId: string, content: string, createdBy: string): Promise<LeadNote> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const lead = this.mockLeads.find(l => l.id === leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const note: LeadNote = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
      createdBy
    };

    if (!lead.notes) {
      lead.notes = [];
    }
    lead.notes.push(note);

    return note;
  }

  async getLeadStats(): Promise<LeadStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const total = this.mockLeads.length;
    const statusCounts = this.mockLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const converted = statusCounts.converted || 0;
    const totalScore = this.mockLeads.reduce((sum, lead) => sum + lead.score, 0);
    const totalValue = this.mockLeads.reduce((sum, lead) => 
      sum + (lead.systemDetails?.estimatedValue || 0), 0
    );

    return {
      total,
      new: statusCounts.new || 0,
      contacted: statusCounts.contacted || 0,
      qualified: statusCounts.qualified || 0,
      converted,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
      averageScore: total > 0 ? totalScore / total : 0,
      totalValue
    };
  }

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: leadData.notes || []
    };

    this.mockLeads.push(newLead);
    return newLead;
  }

  async deleteLead(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.mockLeads.findIndex(lead => lead.id === id);
    if (index === -1) {
      throw new Error('Lead not found');
    }

    this.mockLeads.splice(index, 1);
  }

  async exportLeads(format: 'csv' | 'excel' = 'csv'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (format === 'csv') {
      const headers = 'ID,First Name,Last Name,Email,Phone,Status,Source,Score,Created At\n';
      const rows = this.mockLeads.map(lead => 
        `${lead.id},${lead.firstName},${lead.lastName},${lead.email},${lead.phone || ''},${lead.status},${lead.source},${lead.score},${lead.createdAt}`
      ).join('\n');
      
      return headers + rows;
    }
    
    return 'Excel export functionality would be implemented here';
  }

  // Duplicate detection
  async findDuplicates(): Promise<{ duplicates: Lead[][], confidence: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple mock duplicate detection based on email
    const duplicateGroups: { duplicates: Lead[][], confidence: number }[] = [];
    
    // For demo purposes, create some mock duplicates
    if (this.mockLeads.length > 0) {
      duplicateGroups.push({
        duplicates: [this.mockLeads.slice(0, 2)], // Mock duplicate group
        confidence: 0.85
      });
    }
    
    return duplicateGroups;
  }
}

const leadsService = new LeadsService();
export default leadsService;
export { leadsService };