// Campaign Tracking Utility
// This helps track conversions for A/B testing campaigns

interface ConversionData {
  campaignId?: string;
  conversionValue?: number;
  metadata?: Record<string, any>;
}

class CampaignTracker {
  private static instance: CampaignTracker;

  public static getInstance(): CampaignTracker {
    if (!CampaignTracker.instance) {
      CampaignTracker.instance = new CampaignTracker();
    }
    return CampaignTracker.instance;
  }

  // Get visitor ID from cookie
  private getVisitorId(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'visitor_id') {
        return value;
      }
    }
    return null;
  }

  // Get campaign ID from headers or cookies
  private getCampaignId(): string | null {
    if (typeof document === 'undefined') return null;

    // First try to get from meta tag (set by middleware)
    const metaTag = document.querySelector('meta[name="campaign-id"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }

    // Fallback: look for campaign cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name.startsWith('campaign_')) {
        return name.replace('campaign_', '');
      }
    }
    return null;
  }

  // Track a conversion event
  public async trackConversion(data: ConversionData = {}): Promise<boolean> {
    try {
      const visitorId = this.getVisitorId();
      const campaignId = data.campaignId || this.getCampaignId();

      if (!visitorId || !campaignId) {
        console.log('Campaign tracking: No visitor ID or campaign ID found');
        return false;
      }

      const response = await fetch('/api/campaigns/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          visitorId,
          conversionValue: data.conversionValue || 1,
          metadata: data.metadata || {}
        }),
      });

      if (!response.ok) {
        console.error('Campaign tracking failed:', response.statusText);
        return false;
      }

      console.log('Campaign conversion tracked successfully');
      return true;

    } catch (error) {
      console.error('Error tracking campaign conversion:', error);
      return false;
    }
  }

  // Track page view (automatically called by middleware, but can be called manually)
  public async trackPageView(): Promise<boolean> {
    try {
      const visitorId = this.getVisitorId();
      const campaignId = this.getCampaignId();

      if (!visitorId || !campaignId) {
        return false;
      }

      // Page views are automatically tracked by the assignment API
      // This is just for manual tracking if needed
      console.log('Page view tracked for campaign:', campaignId);
      return true;

    } catch (error) {
      console.error('Error tracking page view:', error);
      return false;
    }
  }

  // Check if current page is part of a campaign
  public isInCampaign(): boolean {
    return this.getCampaignId() !== null;
  }

  // Get current campaign information
  public getCurrentCampaign(): { campaignId: string | null; visitorId: string | null } {
    return {
      campaignId: this.getCampaignId(),
      visitorId: this.getVisitorId()
    };
  }
}

// Export singleton instance
export const campaignTracker = CampaignTracker.getInstance();

// Export class for advanced usage
export default CampaignTracker;