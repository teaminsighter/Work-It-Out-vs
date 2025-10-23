import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import CampaignWrapper from './CampaignWrapper';

interface CampaignPageProps {
  params: {
    campaignUrl: string;
  };
}

// Hash-based variant assignment for consistent distribution
const assignVariant = (visitorId: string, variants: any[]) => {
  let hash = 0;
  for (let i = 0; i < visitorId.length; i++) {
    const char = visitorId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const percentage = Math.abs(hash) % 100;
  
  let cumulativePercentage = 0;
  for (const variant of variants) {
    cumulativePercentage += variant.trafficPercentage;
    if (percentage < cumulativePercentage) {
      return variant;
    }
  }
  
  return variants[0];
};

// Generate visitor ID
const getVisitorId = (cookieStore: ReturnType<typeof cookies>): string => {
  const existingId = cookieStore.get('visitor_id')?.value;
  if (existingId) return existingId;
  
  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

export default async function CampaignPage({ params }: CampaignPageProps) {
  try {
    // Get campaign data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/campaigns/active?url=/${params.campaignUrl}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
      notFound();
      return;
    }

    const data = await response.json();
    const campaign = data.campaign;

    if (!campaign || campaign.status !== 'ACTIVE') {
      notFound();
      return;
    }

    // Get visitor ID from cookies
    const cookieStore = cookies();
    const visitorId = getVisitorId(cookieStore);
    
    // Check if visitor already has an assignment
    let selectedVariant;
    let isNewAssignment = false;
    const existingAssignment = cookieStore.get(`campaign_${campaign.id}`)?.value;
    
    if (existingAssignment) {
      selectedVariant = campaign.variants.find((v: any) => v.id === existingAssignment);
    }
    
    if (!selectedVariant) {
      // Assign new variant
      selectedVariant = assignVariant(visitorId, campaign.variants);
      isNewAssignment = true;
      
      // Track assignment in database (fire and forget)
      fetch(`${baseUrl}/api/campaigns/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          visitorId,
          variantId: selectedVariant.id
        })
      }).catch(console.error);
    }

    // Pass the landing page slug to the wrapper component for client-side rendering
    return (
      <CampaignWrapper
        visitorId={visitorId}
        campaignId={campaign.id}
        variantId={selectedVariant.id}
        isNewAssignment={isNewAssignment}
        landingPageSlug={selectedVariant.landingPageSlug}
      />
    );

  } catch (error) {
    console.error('Error in campaign page:', error);
    notFound();
    return;
  }
}