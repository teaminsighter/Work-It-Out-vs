export interface LandingPageConfig {
  id: string;
  name: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  components: {
    hero: any;
    sections: any[];
    forms: any;
    seo: any;
  };
  variant?: {
    type: 'A';
    traffic: number;
  };
  analytics: {
    views: number;
    conversions: number;
    conversionRate: number;
  };
}

// Default configurations for each landing page variant
export const defaultPageConfigs: Record<string, LandingPageConfig> = {
  main: {
    id: 'main',
    name: 'Main Landing Page',
    slug: '/',
    status: 'published',
    components: {
      hero: {
        type: 'Hero',
        title: 'Transform Your Home with Solar Energy',
        subtitle: 'Get a custom quote in minutes with our advanced solar calculator',
        buttonText: 'Get Free Quote',
        backgroundImage: '/background.png'
      },
      sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
      forms: {
        type: 'QuoteWizard',
        fields: ['name', 'email', 'phone', 'address']
      },
      seo: {
        title: 'Work It Out - Your Solution Platform',
        description: 'Get your insurance quote in minutes.'
      }
    },
    analytics: {
      views: 0,
      conversions: 0,
      conversionRate: 0
    }
  },
  health: {
    id: 'health',
    name: 'Health Insurance Landing',
    slug: '/health',
    status: 'published',
    components: {
      hero: {
        type: 'HeroHealth',
        title: 'Health Insurance Made Simple',
        subtitle: 'Protect your family with comprehensive health coverage',
        buttonText: 'Get Health Quote',
        backgroundImage: '/background.png'
      },
      sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
      forms: {
        type: 'QuoteWizardHealthNew',
        fields: ['name', 'email', 'phone', 'age', 'family_members']
      },
      seo: {
        title: 'Health Solutions - Work It Out',
        description: 'Compare health insurance plans and get the best coverage for your family.'
      }
    },
    analytics: {
      views: 0,
      conversions: 0,
      conversionRate: 0
    }
  },
  income: {
    id: 'income',
    name: 'Income Protection Landing',
    slug: '/income',
    status: 'published',
    components: {
      hero: {
        type: 'HeroIncome',
        title: 'Protect Your Income',
        subtitle: 'Secure your financial future with income protection insurance',
        buttonText: 'Get Income Quote',
        backgroundImage: '/background.png'
      },
      sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
      forms: {
        type: 'QuoteWizardIncome',
        fields: ['name', 'email', 'phone', 'occupation', 'income']
      },
      seo: {
        title: 'Income Solutions - Work It Out',
        description: 'Protect your income with comprehensive income protection insurance plans.'
      }
    },
    analytics: {
      views: 0,
      conversions: 0,
      conversionRate: 0
    }
  },
  life: {
    id: 'life',
    name: 'Life Insurance Landing',
    slug: '/life',
    status: 'published',
    components: {
      hero: {
        type: 'HeroLife',
        title: 'Life Insurance for Peace of Mind',
        subtitle: 'Protect your loved ones with comprehensive life insurance coverage',
        buttonText: 'Get Life Quote',
        backgroundImage: '/background.png'
      },
      sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
      forms: {
        type: 'QuoteWizardLife',
        fields: ['name', 'email', 'phone', 'age', 'coverage_amount']
      },
      seo: {
        title: 'Life Solutions - Work It Out',
        description: 'Compare life insurance plans and secure your family\'s financial future.'
      }
    },
    analytics: {
      views: 0,
      conversions: 0,
      conversionRate: 0
    }
  },
  new: {
    id: 'new',
    name: 'New Design Landing',
    slug: '/new',
    status: 'draft',
    components: {
      hero: {
        type: 'HeroNew',
        title: 'Revolutionary Insurance Experience',
        subtitle: 'Experience the future of insurance with our new platform',
        buttonText: 'Try New Experience',
        backgroundImage: '/background.png'
      },
      sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
      forms: {
        type: 'QuoteWizardNew',
        fields: ['name', 'email', 'phone']
      },
      seo: {
        title: 'New Experience - Work It Out',
        description: 'Experience the future of insurance with our revolutionary new platform.'
      }
    },
    analytics: {
      views: 0,
      conversions: 0,
      conversionRate: 0
    }
  }
};

// Page manager class
export class PageManager {
  private configs: Map<string, LandingPageConfig>;

  constructor() {
    this.configs = new Map();
    // Initialize with defaults
    Object.values(defaultPageConfigs).forEach(config => {
      this.configs.set(config.id, { ...config });
    });
  }

  // Get page configuration
  getPage(id: string): LandingPageConfig | undefined {
    return this.configs.get(id);
  }

  // Get all pages
  getAllPages(): LandingPageConfig[] {
    return Array.from(this.configs.values());
  }

  // Update page configuration
  updatePage(id: string, updates: Partial<LandingPageConfig>): boolean {
    const existing = this.configs.get(id);
    if (!existing) return false;

    this.configs.set(id, { ...existing, ...updates });
    return true;
  }

  // Update specific component
  updateComponent(pageId: string, componentType: keyof LandingPageConfig['components'], updates: any): boolean {
    const page = this.configs.get(pageId);
    if (!page) return false;

    page.components[componentType] = { ...page.components[componentType], ...updates };
    return true;
  }

  // Update analytics
  updateAnalytics(pageId: string, analytics: Partial<LandingPageConfig['analytics']>): boolean {
    const page = this.configs.get(pageId);
    if (!page) return false;

    page.analytics = { ...page.analytics, ...analytics };
    return true;
  }

  // Create new page
  createPage(config: LandingPageConfig): boolean {
    if (this.configs.has(config.id)) return false;
    
    this.configs.set(config.id, config);
    return true;
  }

  // Delete page
  deletePage(id: string): boolean {
    return this.configs.delete(id);
  }

  // Clone page
  clonePage(sourceId: string, newId: string, newName?: string): boolean {
    const source = this.configs.get(sourceId);
    if (!source || this.configs.has(newId)) return false;

    const cloned: LandingPageConfig = {
      ...source,
      id: newId,
      name: newName || `${source.name} (Copy)`,
      slug: `/${newId}`,
      analytics: {
        views: 0,
        conversions: 0,
        conversionRate: 0
      }
    };

    this.configs.set(newId, cloned);
    return true;
  }

  // Get page by slug
  getPageBySlug(slug: string): LandingPageConfig | undefined {
    for (const config of this.configs.values()) {
      if (config.slug === slug) {
        return config;
      }
    }
    return undefined;
  }

  // Export configuration
  exportConfig(): Record<string, LandingPageConfig> {
    const result: Record<string, LandingPageConfig> = {};
    for (const [id, config] of this.configs.entries()) {
      result[id] = config;
    }
    return result;
  }

  // Import configuration
  importConfig(configs: Record<string, LandingPageConfig>): void {
    this.configs.clear();
    Object.entries(configs).forEach(([id, config]) => {
      this.configs.set(id, config);
    });
  }
}

// Singleton instance
export const pageManager = new PageManager();