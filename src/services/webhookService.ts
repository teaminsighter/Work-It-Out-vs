// Mock Webhook Service for Admin Panel
export interface Webhook {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: WebhookEvent[];
  headers: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

export interface WebhookEvent {
  type: 'lead.created' | 'lead.updated' | 'lead.converted' | 'quote.generated' | 'page.viewed';
  description: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failure';
  statusCode?: number;
  responseTime: number;
  payload: any;
  response?: any;
  error?: string;
  timestamp: string;
}

export interface WebhookTest {
  success: boolean;
  statusCode?: number;
  responseTime: number;
  response?: any;
  error?: string;
}

class WebhookService {
  private webhooks: Webhook[] = [
    {
      id: '1',
      name: 'CRM Integration',
      url: 'https://api.crm.example.com/webhooks/leads',
      method: 'POST',
      events: [
        { type: 'lead.created', description: 'New lead is created' },
        { type: 'lead.converted', description: 'Lead converts to customer' }
      ],
      headers: {
        'Authorization': 'Bearer xyz123',
        'Content-Type': 'application/json'
      },
      isActive: true,
      createdAt: '2024-09-15T10:00:00Z',
      lastTriggered: '2024-09-28T15:30:00Z',
      successCount: 145,
      failureCount: 3
    },
    {
      id: '2',
      name: 'Email Marketing',
      url: 'https://api.mailchimp.com/3.0/webhooks',
      method: 'POST',
      events: [
        { type: 'lead.created', description: 'New lead is created' },
        { type: 'quote.generated', description: 'Quote is generated' }
      ],
      headers: {
        'Authorization': 'Bearer abc456',
        'Content-Type': 'application/json'
      },
      isActive: true,
      createdAt: '2024-09-10T14:20:00Z',
      lastTriggered: '2024-09-28T12:15:00Z',
      successCount: 89,
      failureCount: 1
    },
    {
      id: '3',
      name: 'Analytics Tracker',
      url: 'https://analytics.example.com/webhook',
      method: 'POST',
      events: [
        { type: 'page.viewed', description: 'Page is viewed' },
        { type: 'lead.created', description: 'New lead is created' }
      ],
      headers: {
        'X-API-Key': 'analytics-key-789',
        'Content-Type': 'application/json'
      },
      isActive: false,
      createdAt: '2024-09-20T09:45:00Z',
      successCount: 234,
      failureCount: 12
    }
  ];

  private webhookLogs: WebhookLog[] = [
    {
      id: '1',
      webhookId: '1',
      event: 'lead.created',
      status: 'success',
      statusCode: 200,
      responseTime: 234,
      payload: { leadId: 'lead123', email: 'test@example.com' },
      response: { success: true, id: 'crm456' },
      timestamp: '2024-09-28T15:30:00Z'
    },
    {
      id: '2',
      webhookId: '2',
      event: 'quote.generated',
      status: 'failure',
      statusCode: 400,
      responseTime: 1203,
      payload: { quoteId: 'quote789' },
      error: 'Invalid payload format',
      timestamp: '2024-09-28T14:20:00Z'
    }
  ];

  private availableEvents: WebhookEvent[] = [
    { type: 'lead.created', description: 'Triggered when a new lead is created' },
    { type: 'lead.updated', description: 'Triggered when a lead is updated' },
    { type: 'lead.converted', description: 'Triggered when a lead converts' },
    { type: 'quote.generated', description: 'Triggered when a quote is generated' },
    { type: 'page.viewed', description: 'Triggered when a page is viewed' }
  ];

  async getWebhooks(): Promise<Webhook[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.webhooks];
  }

  async getWebhook(id: string): Promise<Webhook | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.webhooks.find(w => w.id === id) || null;
  }

  async createWebhook(webhookData: Omit<Webhook, 'id' | 'createdAt' | 'successCount' | 'failureCount'>): Promise<Webhook> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newWebhook: Webhook = {
      ...webhookData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      successCount: 0,
      failureCount: 0
    };

    this.webhooks.push(newWebhook);
    return newWebhook;
  }

  async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const webhookIndex = this.webhooks.findIndex(w => w.id === id);
    if (webhookIndex === -1) {
      throw new Error('Webhook not found');
    }

    this.webhooks[webhookIndex] = { ...this.webhooks[webhookIndex], ...updates };
    return this.webhooks[webhookIndex];
  }

  async deleteWebhook(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.webhooks.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Webhook not found');
    }

    this.webhooks.splice(index, 1);
  }

  async testWebhook(id: string): Promise<WebhookTest> {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    const webhook = this.webhooks.find(w => w.id === id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // Simulate test result
    const isSuccess = Math.random() > 0.2; // 80% success rate for demo
    
    if (isSuccess) {
      return {
        success: true,
        statusCode: 200,
        responseTime: Math.floor(Math.random() * 500) + 100,
        response: { message: 'Test webhook received successfully' }
      };
    } else {
      return {
        success: false,
        statusCode: 500,
        responseTime: Math.floor(Math.random() * 2000) + 500,
        error: 'Connection timeout or server error'
      };
    }
  }

  async getWebhookLogs(webhookId?: string, limit: number = 50): Promise<WebhookLog[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let logs = [...this.webhookLogs];
    
    if (webhookId) {
      logs = logs.filter(log => log.webhookId === webhookId);
    }
    
    return logs.slice(0, limit).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getAvailableEvents(): Promise<WebhookEvent[]> {
    return [...this.availableEvents];
  }

  async triggerWebhook(webhookId: string, event: string, payload: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const webhook = this.webhooks.find(w => w.id === webhookId);
    if (!webhook || !webhook.isActive) {
      return;
    }

    // Simulate webhook execution
    const isSuccess = Math.random() > 0.1; // 90% success rate
    const responseTime = Math.floor(Math.random() * 1000) + 100;
    
    const log: WebhookLog = {
      id: Date.now().toString(),
      webhookId,
      event,
      status: isSuccess ? 'success' : 'failure',
      statusCode: isSuccess ? 200 : 500,
      responseTime,
      payload,
      timestamp: new Date().toISOString()
    };

    if (isSuccess) {
      log.response = { success: true, processed: true };
      webhook.successCount++;
    } else {
      log.error = 'Random simulated error';
      webhook.failureCount++;
    }

    webhook.lastTriggered = new Date().toISOString();
    this.webhookLogs.unshift(log);
    
    // Keep only last 100 logs
    if (this.webhookLogs.length > 100) {
      this.webhookLogs = this.webhookLogs.slice(0, 100);
    }
  }

  // Helper method to trigger webhooks for specific events
  async triggerEventWebhooks(eventType: WebhookEvent['type'], payload: any): Promise<void> {
    const activeWebhooks = this.webhooks.filter(w => 
      w.isActive && w.events.some(e => e.type === eventType)
    );

    // Trigger all matching webhooks
    await Promise.all(
      activeWebhooks.map(webhook => 
        this.triggerWebhook(webhook.id, eventType, payload)
      )
    );
  }

  async getWebhookStats(): Promise<{
    total: number;
    active: number;
    totalRequests: number;
    successRate: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const total = this.webhooks.length;
    const active = this.webhooks.filter(w => w.isActive).length;
    const totalSuccesses = this.webhooks.reduce((sum, w) => sum + w.successCount, 0);
    const totalFailures = this.webhooks.reduce((sum, w) => sum + w.failureCount, 0);
    const totalRequests = totalSuccesses + totalFailures;
    const successRate = totalRequests > 0 ? (totalSuccesses / totalRequests) * 100 : 0;

    return {
      total,
      active,
      totalRequests,
      successRate
    };
  }
}

export const webhookService = new WebhookService();