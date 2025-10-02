
'use client';

import AdminControlledPage from '@/components/AdminControlledPage';

export default function NewPage() {
  return (
    <AdminControlledPage
      pageId="new"
      slug="/new"
      fallbackConfig={{
        name: 'New Design Landing',
        status: 'draft',
        components: {
          hero: {
            type: 'HeroNew',
            title: 'Revolutionary Insurance Experience',
            subtitle: 'Experience the future of insurance with our new platform',
            buttonText: 'Try New Experience'
          },
          sections: ['Insurers', 'FinancialProtection', 'Services', 'Benefits', 'HowItWorks', 'Testimonials', 'CTA'],
          forms: {
            type: 'QuoteWizardNew',
            fields: ['name', 'email', 'phone']
          },
          seo: {
            title: 'New Insurance Experience - Work It Out',
            description: 'Experience the future of insurance with our revolutionary new platform.'
          }
        }
      }}
    />
  );
}
