// AI Service - Core AI assistant functionality
import OpenAI from 'openai';

export interface AIConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  action?: string;
  data?: any;
}

export interface AIResponse {
  message: string;
  action?: string;
  data?: any;
  success: boolean;
  error?: string;
}

export interface CommandResult {
  type: 'query' | 'navigation' | 'action' | 'info';
  data?: any;
  message: string;
  success: boolean;
}

class AIService {
  private openai: OpenAI | null = null;
  private conversationHistory: AIConversationMessage[] = [];

  constructor() {
    if (typeof window === 'undefined' && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  // Initialize conversation with system context
  private getSystemPrompt(): string {
    return `You are an intelligent AI assistant for a solar panel business admin system. You're helpful, detailed, and knowledgeable about solar installations, lead management, and business analytics.

PERSONALITY: 
- Be friendly, professional, and conversational like ChatGPT
- Provide detailed, well-structured responses with clear explanations
- Use emojis and formatting to make responses more engaging
- Always offer next steps and suggestions
- Be proactive in helping users understand their data

AVAILABLE FUNCTIONS:
1. getLeads(filters) - Retrieve leads from database with filtering options
2. getLeadStats() - Get comprehensive lead statistics and conversion metrics
3. searchLeads(query, filters) - Search leads by name, email, phone, or other criteria
4. navigateToSection(category, tab) - Navigate to specific admin panel sections
5. generateReport(type, parameters) - Create detailed business reports
6. getAnalyticsOverview() - Get dashboard overview with key metrics and KPIs
7. getStepAnalytics() - Analyze step-by-step conversion funnel performance
8. getMarketingAnalytics() - Review marketing campaigns and ROI analysis
9. getVisitorTracking() - Real-time visitor behavior and traffic analysis
10. getConversionFunnel() - Detailed conversion rate analysis by step

EXACT ADMIN SECTIONS AND TABS (use these exact names and IDs):

1. **Analytics Dashboard** (analytics) - 6 tabs:
   - overview: Overview - Key metrics, performance dashboard
   - steps: Step Analytics - Conversion funnel analysis
   - leads: Lead Analysis - Lead quality and conversion metrics
   - marketing: Marketing Analysis - Campaign performance and ROI
   - realtime: Real-time Tracking - Live visitor monitoring
   - visitors: Visitor Tracking - User behavior analysis

2. **CRM** (lead-management) - 4 tabs:
   - all-leads: All Leads - Complete lead management system
   - lead-analysis: Lead Analysis - Advanced analytics and reporting
   - duplicates: Duplicate Analysis - Data cleansing and merge tools
   - reports: Export/Reports - Custom reports and data export

3. **Page Builder** (page-builder) - 4 tabs:
   - landing-pages: Landing Pages - Visual page creation
   - forms: Forms - Advanced form builder
   - templates: Templates - Pre-built templates library
   - ab-testing: A/B Testing - Split testing tools

4. **Tracking Setup** (tracking) - 4 tabs:
   - datalayer: DataLayer Events - Event tracking setup
   - gtm-config: GTM Config - Google Tag Manager configuration
   - integrations: Platform Integrations - Third-party connections
   - conversion-api: Conversion API - Server-side tracking

5. **AI Insights** (ai-insights) - 4 tabs:
   - chatbot: Chatbot Query - AI-powered queries
   - auto-reports: Auto Reports - Automated report generation
   - recommendations: Recommendations - AI-driven suggestions
   - alerts: Performance Alerts - Automated monitoring

6. **Integrations** (integrations) - 4 tabs:
   - google-ads: Google Ads - Campaign management
   - facebook-ads: Facebook Ads - Social media advertising
   - ga4: GA4 - Google Analytics 4 integration
   - webhooks: Webhooks/APIs - External system connections

7. **User Management** (user-management) - 4 tabs:
   - profile: My Profile - Personal account settings
   - admin-users: Manage Users - Team member management
   - permissions: Permissions - Access control settings
   - activity-logs: Activity Logs - System activity tracking

8. **System Settings** (system) - 5 tabs:
   - general: General Settings - Basic system configuration
   - api-config: API Configuration - External API settings
   - solar-pricing: Solar Pricing - Pricing tier management
   - database: Database - Database management tools
   - backup: Backup - Data backup and restore

TOTAL: 8 categories, 35 tabs

LEAD INFORMATION:
- Statuses: new → contacted → qualified → proposal_sent → converted/not_interested
- Priority levels: Calculated based on system size, budget, and engagement
- Sources: Website, Google Ads, Facebook Ads, referrals, organic search

RESPONSE GUIDELINES:
1. Always provide context and explanations
2. Include relevant statistics and insights
3. Suggest actionable next steps
4. Use clear formatting with headers, bullet points, and emojis
5. If calling a function, explain why and what to expect

When users ask questions, intelligently determine whether to query data, navigate to sections, or provide educational information about solar business management.`;
  }

  // Process user message with ChatGPT and function calling
  async processMessage(userMessage: string, context?: string): Promise<AIResponse> {
    try {
      if (!this.openai) {
        return {
          message: "AI service is not properly configured. Please check API keys.",
          success: false,
          error: "Missing OpenAI configuration"
        };
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      // Prepare messages for OpenAI with context
      const systemPrompt = this.getSystemPrompt() + (context ? `\n\n${context}` : '');
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory.slice(-10) // Keep last 10 messages for context
      ];

      // Call OpenAI with tools (modern function calling)
      const completion = await this.openai.chat.completions.create({
        model: process.env.AI_ASSISTANT_MODEL || 'gpt-4',
        messages,
        tools: this.getToolDefinitions(),
        tool_choice: 'auto',
        max_tokens: parseInt(process.env.AI_ASSISTANT_MAX_TOKENS || '1000'),
        temperature: parseFloat(process.env.AI_ASSISTANT_TEMPERATURE || '0.1'),
      });

      const response = completion.choices[0]?.message;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Handle tool calling
      if (response.tool_calls && response.tool_calls.length > 0) {
        const toolCall = response.tool_calls[0];
        if (toolCall.type === 'function') {
          const functionResult = await this.executeFunctionCall(
            toolCall.function.name,
            toolCall.function.arguments
          );

          // Generate final response based on function result
          const finalResponse = await this.generateResponseFromFunctionResult(
            userMessage,
            functionResult
          );

          // Add assistant response to history
          this.conversationHistory.push({
            role: 'assistant',
            content: finalResponse.message,
            timestamp: new Date().toISOString(),
            action: finalResponse.action,
            data: finalResponse.data
          });

          return finalResponse;
        }
      }

      // Regular text response
      const assistantMessage = response.content || 'I apologize, but I couldn\'t process your request.';
      
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toISOString()
      });

      return {
        message: assistantMessage,
        success: true
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        message: 'I encountered an error processing your request. Please try again.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Define available tools for ChatGPT
  private getToolDefinitions(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'getLeads',
          description: 'Get leads from database with optional filters',
          parameters: {
            type: 'object',
            properties: {
              status: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by lead status (new, contacted, qualified, etc.)'
              },
              priority: {
                type: 'array', 
                items: { type: 'string' },
                description: 'Filter by priority (high, medium, low)'
              },
              source: {
                type: 'string',
                description: 'Filter by lead source'
              },
              limit: {
                type: 'number',
                description: 'Number of leads to return'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getLeadStats',
          description: 'Get lead statistics and conversion metrics',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'searchLeads',
          description: 'Search leads by text query with filters',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Text to search for in lead data'
              },
              filters: {
                type: 'object',
                description: 'Additional filters to apply'
              }
            },
            required: ['query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'navigateToSection',
          description: 'Navigate to specific admin panel section',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Main category (analytics, lead-management, page-builder, etc.)'
              },
              tab: {
                type: 'string',
                description: 'Specific tab within category'
              }
            },
            required: ['category']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'generateReport',
          description: 'Generate various types of reports',
          parameters: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['lead-summary', 'conversion-rates', 'source-analysis', 'monthly-report'],
                description: 'Type of report to generate'
              },
              dateRange: {
                type: 'object',
                properties: {
                  start: { type: 'string' },
                  end: { type: 'string' }
                }
              }
            },
            required: ['type']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getAnalyticsOverview',
          description: 'Get comprehensive analytics dashboard overview with key metrics',
          parameters: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['today', 'week', 'month', 'quarter', 'year'],
                description: 'Time period for analytics data'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getStepAnalytics',
          description: 'Analyze step-by-step conversion funnel and drop-off rates',
          parameters: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['today', 'week', 'month', 'quarter'],
                description: 'Time period for step analytics'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getMarketingAnalytics',
          description: 'Review marketing campaign performance and ROI analysis',
          parameters: {
            type: 'object',
            properties: {
              campaigns: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific campaigns to analyze (google-ads, facebook-ads, organic)'
              },
              timeframe: {
                type: 'string',
                enum: ['week', 'month', 'quarter'],
                description: 'Time period for campaign analysis'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getVisitorTracking',
          description: 'Get real-time visitor behavior and website traffic analysis',
          parameters: {
            type: 'object',
            properties: {
              realtime: {
                type: 'boolean',
                description: 'Whether to get real-time data or historical'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getConversionFunnel',
          description: 'Detailed conversion rate analysis by funnel step',
          parameters: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description: 'Traffic source to analyze (google-ads, facebook-ads, organic, all)'
              },
              timeframe: {
                type: 'string',
                enum: ['week', 'month', 'quarter'],
                description: 'Time period for funnel analysis'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'analyzeCurrentTab',
          description: 'Analyze the current admin panel tab content and provide insights',
          parameters: {
            type: 'object',
            properties: {
              includeDetails: {
                type: 'boolean',
                description: 'Include detailed analysis of current tab features'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getContextualHelp',
          description: 'Get help and guidance for the current admin panel section',
          parameters: {
            type: 'object',
            properties: {
              helpType: {
                type: 'string',
                enum: ['features', 'howto', 'tips', 'troubleshooting'],
                description: 'Type of help needed'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getBrowserStats',
          description: 'Get detailed browser usage statistics (Safari, Chrome, Firefox, etc.)',
          parameters: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['today', 'week', 'month', 'all'],
                description: 'Time period for browser analysis'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getDeviceStats',
          description: 'Get device usage statistics (mobile vs desktop)',
          parameters: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['today', 'week', 'month', 'all'],
                description: 'Time period for device analysis'
              }
            }
          }
        }
      }
    ];
  }

  // Execute function calls
  private async executeFunctionCall(functionName: string, argumentsJson: string): Promise<CommandResult> {
    try {
      const args = JSON.parse(argumentsJson);
      
      switch (functionName) {
        case 'getLeads':
          return await this.handleGetLeads(args);
        case 'getLeadStats':
          return await this.handleGetLeadStats();
        case 'searchLeads':
          return await this.handleSearchLeads(args);
        case 'navigateToSection':
          return await this.handleNavigation(args);
        case 'generateReport':
          return await this.handleGenerateReport(args);
        case 'getAnalyticsOverview':
          return await this.handleAnalyticsOverview(args);
        case 'getStepAnalytics':
          return await this.handleStepAnalytics(args);
        case 'getMarketingAnalytics':
          return await this.handleMarketingAnalytics(args);
        case 'getVisitorTracking':
          return await this.handleVisitorTracking(args);
        case 'getConversionFunnel':
          return await this.handleConversionFunnel(args);
        case 'analyzeCurrentTab':
          return await this.handleAnalyzeCurrentTab(args);
        case 'getContextualHelp':
          return await this.handleContextualHelp(args);
        case 'getBrowserStats':
          return await this.handleBrowserStats(args);
        case 'getDeviceStats':
          return await this.handleDeviceStats(args);
        default:
          return {
            type: 'info',
            message: `Unknown function: ${functionName}`,
            success: false
          };
      }
    } catch (error) {
      return {
        type: 'info',
        message: `Error executing function: ${error}`,
        success: false
      };
    }
  }

  // Function handlers - These will be handled by API route
  private async handleGetLeads(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getLeads', args },
      message: 'Fetching leads from database...',
      success: true
    };
  }

  private async handleGetLeadStats(): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getLeadStats', args: {} },
      message: 'Fetching lead statistics...',
      success: true
    };
  }

  private async handleSearchLeads(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'searchLeads', args },
      message: `Searching leads for "${args.query}"...`,
      success: true
    };
  }

  private async handleNavigation(args: any): Promise<CommandResult> {
    const { category, tab } = args;
    
    return {
      type: 'navigation',
      data: { category, tab },
      message: `Navigating to ${category}${tab ? ` → ${tab}` : ''}`,
      success: true
    };
  }

  private async handleGenerateReport(args: any): Promise<CommandResult> {
    const { type, dateRange } = args;
    
    return {
      type: 'action',
      data: { reportType: type, dateRange },
      message: `Generating ${type} report`,
      success: true
    };
  }

  // New analytics handlers
  private async handleAnalyticsOverview(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getAnalyticsOverview', args },
      message: 'Fetching analytics overview...',
      success: true
    };
  }

  private async handleStepAnalytics(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getStepAnalytics', args },
      message: 'Analyzing conversion funnel steps...',
      success: true
    };
  }

  private async handleMarketingAnalytics(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getMarketingAnalytics', args },
      message: 'Analyzing marketing campaign performance...',
      success: true
    };
  }

  private async handleVisitorTracking(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getVisitorTracking', args },
      message: 'Fetching visitor tracking data...',
      success: true
    };
  }

  private async handleConversionFunnel(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getConversionFunnel', args },
      message: 'Analyzing conversion funnel performance...',
      success: true
    };
  }

  private async handleAnalyzeCurrentTab(args: any): Promise<CommandResult> {
    return {
      type: 'action',
      data: { action: 'analyzeTab', includeDetails: args.includeDetails },
      message: 'Analyzing current tab content and features...',
      success: true
    };
  }

  private async handleContextualHelp(args: any): Promise<CommandResult> {
    return {
      type: 'action',
      data: { action: 'contextualHelp', helpType: args.helpType },
      message: `Providing ${args.helpType || 'general'} help for current section...`,
      success: true
    };
  }

  private async handleBrowserStats(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getBrowserStats', args },
      message: 'Analyzing browser usage statistics...',
      success: true
    };
  }

  private async handleDeviceStats(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getDeviceStats', args },
      message: 'Analyzing device usage statistics...',
      success: true
    };
  }

  // Generate final response from function result
  private async generateResponseFromFunctionResult(
    userMessage: string,
    functionResult: CommandResult
  ): Promise<AIResponse> {
    if (!functionResult.success) {
      return {
        message: functionResult.message,
        success: false,
        error: 'Function execution failed'
      };
    }

    let responseMessage = '';

    // Generate detailed responses based on function type and data
    if (functionResult.type === 'query' && functionResult.data) {
      if (Array.isArray(functionResult.data)) {
        const leads = functionResult.data;
        
        if (leads.length === 0) {
          responseMessage = `I couldn't find any leads matching your criteria. Here are some suggestions:\n\n• Try searching with different keywords\n• Check if leads exist in your database\n• Ensure your search terms are spelled correctly\n\nWould you like me to show you all leads instead?`;
        } else {
          responseMessage = `Great! I found **${leads.length} leads** in your database. Here's a detailed breakdown:\n\n`;
          
          // Status breakdown
          const statusCounts = leads.reduce((acc: any, lead: any) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
          }, {});
          
          responseMessage += `📊 **Status Overview:**\n`;
          Object.entries(statusCounts).forEach(([status, count]) => {
            responseMessage += `• ${status}: ${count} leads\n`;
          });
          
          // Show detailed lead information
          responseMessage += `\n📋 **Lead Details:**\n`;
          leads.slice(0, 5).forEach((lead: any, index: number) => {
            responseMessage += `\n**${index + 1}. ${lead.firstName} ${lead.lastName}**\n`;
            responseMessage += `   • Email: ${lead.email}\n`;
            responseMessage += `   • Phone: ${lead.phone || 'Not provided'}\n`;
            responseMessage += `   • Status: ${lead.status}\n`;
            responseMessage += `   • Source: ${lead.source}\n`;
            responseMessage += `   • Created: ${new Date(lead.createdAt).toLocaleDateString()}\n`;
          });
          
          if (leads.length > 5) {
            responseMessage += `\n... and ${leads.length - 5} more leads.\n`;
          }
          
          responseMessage += `\n💡 **Quick Actions:**\n`;
          responseMessage += `• Ask me to "search for [name]" to find specific leads\n`;
          responseMessage += `• Say "show me new leads" to filter by status\n`;
          responseMessage += `• Ask for "lead statistics" to see conversion metrics\n`;
        }
      } else if (functionResult.data.totalLeads !== undefined) {
        // Lead statistics response
        const stats = functionResult.data;
        responseMessage = `📈 **Lead Statistics Overview:**\n\n`;
        responseMessage += `🎯 **Total Leads:** ${stats.totalLeads}\n\n`;
        
        if (stats.statusBreakdown) {
          responseMessage += `📊 **Status Breakdown:**\n`;
          Object.entries(stats.statusBreakdown).forEach(([status, count]) => {
            const percentage = ((count as number / stats.totalLeads) * 100).toFixed(1);
            responseMessage += `• ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count} (${percentage}%)\n`;
          });
        }
        
        responseMessage += `\n💼 **Key Insights:**\n`;
        responseMessage += `• You have ${stats.totalLeads} total leads in your system\n`;
        if (stats.convertedCount) {
          const conversionRate = ((stats.convertedCount / stats.totalLeads) * 100).toFixed(1);
          responseMessage += `• Conversion rate: ${conversionRate}%\n`;
        }
        responseMessage += `• This data helps track your sales pipeline performance\n`;
        
        responseMessage += `\n🚀 **Next Steps:**\n`;
        responseMessage += `• Ask me to "show high priority leads" to focus on hot prospects\n`;
        responseMessage += `• Say "navigate to analytics" to see detailed charts\n`;
        responseMessage += `• Request "leads from Google Ads" to see campaign performance\n`;
      }
    } else if (functionResult.data.overview) {
      // Analytics overview response
      const analytics = functionResult.data;
      responseMessage = `📊 **Analytics Overview - ${analytics.timeframe.charAt(0).toUpperCase() + analytics.timeframe.slice(1)}**\n\n`;
      
      responseMessage += `🎯 **Key Metrics:**\n`;
      responseMessage += `• Total Leads: **${analytics.overview.totalLeads}**\n`;
      responseMessage += `• Total Visitors: **${analytics.overview.totalVisitors}**\n`;
      responseMessage += `• Recent Leads: **${analytics.overview.recentLeads}**\n`;
      responseMessage += `• Recent Visitors: **${analytics.overview.recentVisitors}**\n`;
      responseMessage += `• Conversion Rate: **${analytics.overview.conversionRate}%**\n\n`;
      
      if (analytics.topSources.length > 0) {
        responseMessage += `🔥 **Top Traffic Sources:**\n`;
        analytics.topSources.forEach((source: any, index: number) => {
          responseMessage += `${index + 1}. ${source.source}: ${source.leads} leads\n`;
        });
      }
      
      responseMessage += `\n💡 **Insights:**\n`;
      responseMessage += `• Your conversion rate of ${analytics.overview.conversionRate}% is ${analytics.overview.conversionRate > 5 ? 'excellent' : analytics.overview.conversionRate > 2 ? 'good' : 'needs improvement'}\n`;
      responseMessage += `• Focus on optimizing your top-performing source: ${analytics.topSources[0]?.source || 'organic'}\n`;
      
    } else if (functionResult.data.steps) {
      // Step analytics response
      const stepData = functionResult.data;
      responseMessage = `📈 **Step Analytics - ${stepData.timeframe.charAt(0).toUpperCase() + stepData.timeframe.slice(1)}**\n\n`;
      
      responseMessage += `🚀 **Conversion Funnel:**\n`;
      stepData.steps.forEach((step: any, index: number) => {
        responseMessage += `${index + 1}. ${step.step}: ${step.visitors} visitors (${step.rate}%)\n`;
      });
      
      responseMessage += `\n⚠️ **Major Drop-off Points:**\n`;
      stepData.dropoffPoints.forEach((dropoff: any) => {
        responseMessage += `• ${dropoff.from} → ${dropoff.to}: ${dropoff.dropoff}% drop\n`;
      });
      
    } else if (functionResult.data.campaigns) {
      // Marketing analytics response
      const marketing = functionResult.data;
      responseMessage = `📱 **Marketing Analytics - ${marketing.timeframe.charAt(0).toUpperCase() + marketing.timeframe.slice(1)}**\n\n`;
      
      responseMessage += `💰 **Campaign Performance:**\n`;
      marketing.campaigns.forEach((campaign: any) => {
        responseMessage += `\n**${campaign.name}:**\n`;
        responseMessage += `• Leads: ${campaign.leads}\n`;
        responseMessage += `• Clicks: ${campaign.clicks.toLocaleString()}\n`;
        responseMessage += `• Cost: $${campaign.cost.toLocaleString()}\n`;
        responseMessage += `• CPL: $${campaign.cpl}\n`;
        if (campaign.roas > 0) responseMessage += `• ROAS: ${campaign.roas}x\n`;
      });
      
      responseMessage += `\n📊 **Summary:**\n`;
      responseMessage += `• Total Ad Spend: $${marketing.totalSpend.toLocaleString()}\n`;
      responseMessage += `• Total Leads: ${marketing.totalLeads}\n`;
      
    } else if (functionResult.data.realtime !== undefined) {
      // Visitor tracking response
      const visitors = functionResult.data;
      responseMessage = `👥 **Visitor Tracking ${visitors.realtime ? '(Real-time)' : '(Historical)'}**\n\n`;
      
      if (visitors.realtime) {
        responseMessage += `🔴 **Live Data:**\n`;
        responseMessage += `• Active Visitors: **${visitors.activeVisitors}**\n`;
        responseMessage += `• Last Update: ${new Date(visitors.lastUpdate).toLocaleTimeString()}\n\n`;
      } else {
        responseMessage += `📈 **Total Visitors: ${visitors.totalVisitors}**\n\n`;
      }
      
      responseMessage += `🏆 **Top Pages:**\n`;
      visitors.topPages.slice(0, 5).forEach((page: any, index: number) => {
        responseMessage += `${index + 1}. ${page.page}: ${page.visitors} visitors\n`;
      });
      
    } else if (functionResult.data.steps && functionResult.data.source) {
      // Conversion funnel response
      const funnel = functionResult.data;
      responseMessage = `🎯 **Conversion Funnel Analysis**\n`;
      responseMessage += `Source: ${funnel.source} | Timeframe: ${funnel.timeframe}\n\n`;
      
      responseMessage += `📊 **Funnel Steps:**\n`;
      funnel.steps.forEach((step: any, index: number) => {
        const arrow = index > 0 ? '⬇️ ' : '🔴 ';
        responseMessage += `${arrow}${step.stage}: ${step.count.toLocaleString()} (${step.rate}%)\n`;
      });
      
      const finalConversion = funnel.steps[funnel.steps.length - 1];
      responseMessage += `\n🎉 **Overall Conversion Rate: ${finalConversion.rate}%**\n`;
      
      responseMessage += `\n💡 **Optimization Tips:**\n`;
      responseMessage += `• Focus on the biggest drop-off points\n`;
      responseMessage += `• A/B test your form and checkout process\n`;
      responseMessage += `• Consider retargeting campaigns for warm traffic\n`;
      
    } else if (functionResult.type === 'navigation') {
      responseMessage = `🧭 **Navigation Complete!**\n\n`;
      responseMessage += `I've directed you to the **${functionResult.data.category}** section`;
      if (functionResult.data.tab) {
        responseMessage += ` → **${functionResult.data.tab}** tab`;
      }
      responseMessage += `.\n\n`;
      responseMessage += `You can now:\n`;
      responseMessage += `• Explore the features in this section\n`;
      responseMessage += `• Ask me questions about what you see\n`;
      responseMessage += `• Request to navigate to other sections\n`;
    } else {
      // Fallback to original message
      responseMessage = functionResult.message;
    }

    return {
      message: responseMessage,
      action: functionResult.type,
      data: functionResult.data,
      success: true
    };
  }

  // Get conversation history
  getConversationHistory(): AIConversationMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;