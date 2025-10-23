import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Get or create visitor ID
const getVisitorId = (request: NextRequest): string => {
  const existingId = request.cookies.get('visitor_id')?.value;
  if (existingId) return existingId;
  
  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

// Hash-based variant assignment for consistent distribution
const assignVariant = (visitorId: string, variants: any[]) => {
  // Create a simple hash from visitor ID
  let hash = 0;
  for (let i = 0; i < visitorId.length; i++) {
    const char = visitorId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get positive percentage (0-99)
  const percentage = Math.abs(hash) % 100;
  
  // Assign based on cumulative percentages
  let cumulativePercentage = 0;
  for (const variant of variants) {
    cumulativePercentage += variant.trafficPercentage;
    if (percentage < cumulativePercentage) {
      return variant;
    }
  }
  
  // Fallback to first variant
  return variants[0];
};

// Simple campaign cache to avoid API calls in middleware
const campaignCache = new Map();

// Check if URL is a campaign URL and get campaign data
const getCampaignForUrl = async (campaignUrl: string) => {
  try {
    // Check cache first
    if (campaignCache.has(campaignUrl)) {
      const cached = campaignCache.get(campaignUrl);
      // Cache for 1 minute
      if (Date.now() - cached.timestamp < 60000) {
        return cached.campaign;
      }
    }

    // For middleware, we'll use a simplified approach
    // In production, use direct database connection
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/campaigns/active?url=${encodeURIComponent(campaignUrl)}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const campaign = data.campaign;
    
    // Cache the result
    campaignCache.set(campaignUrl, {
      campaign,
      timestamp: Date.now()
    });
    
    return campaign;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  
  console.log('🚀 MIDDLEWARE RUNNING FOR:', pathname);
  
  // Skip middleware for API routes, static files, and admin pages
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/admin/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    console.log('Middleware: Skipping for:', pathname);
    return NextResponse.next();
  }

  try {
    // Check if this pathname is a campaign URL
    console.log('Middleware: Checking campaign for URL:', pathname);
    const campaign = await getCampaignForUrl(pathname);
    
    if (!campaign || campaign.status !== 'ACTIVE') {
      console.log('Middleware: No active campaign found for:', pathname);
      return NextResponse.next();
    }

    console.log('Middleware: Found active campaign:', campaign.name, 'with variants:', campaign.variants.length);

    // Get visitor ID
    const visitorId = getVisitorId(request);
    console.log('Middleware: Visitor ID:', visitorId);
    
    // Check if visitor already has an assignment (cookie)
    const existingAssignment = request.cookies.get(`campaign_${campaign.id}`)?.value;
    let selectedVariant;
    
    if (existingAssignment) {
      // Find the variant from the existing assignment
      selectedVariant = campaign.variants.find((v: any) => v.id === existingAssignment);
      console.log('Middleware: Found existing assignment:', existingAssignment, 'variant:', selectedVariant?.name);
    }
    
    if (!selectedVariant) {
      // Assign new variant
      selectedVariant = assignVariant(visitorId, campaign.variants);
      console.log('Middleware: Assigned new variant:', selectedVariant.name, 'landing page:', selectedVariant.landingPageSlug);
      
      // Call assignment API to track in database
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/campaigns/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId: campaign.id,
            visitorId,
            sessionId: request.cookies.get('session_id')?.value,
            userAgent: request.headers.get('user-agent'),
            ipAddress: request.ip || request.headers.get('x-forwarded-for'),
            referrer: request.headers.get('referer')
          })
        });
      } catch (error) {
        console.error('Error tracking assignment:', error);
      }
    } else {
      console.log('Middleware: Using existing variant:', selectedVariant.name, 'landing page:', selectedVariant.landingPageSlug);
    }

    // Rewrite to the selected landing page
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = selectedVariant.landingPageSlug;
    
    console.log('Middleware: Rewriting from', pathname, 'to', selectedVariant.landingPageSlug);
    
    const response = NextResponse.rewrite(rewriteUrl);
    
    // Set visitor ID cookie if not exists
    if (!request.cookies.get('visitor_id')) {
      response.cookies.set('visitor_id', visitorId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    
    // Set campaign assignment cookie
    response.cookies.set(`campaign_${campaign.id}`, selectedVariant.id, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Add headers for tracking
    response.headers.set('X-Campaign-ID', campaign.id);
    response.headers.set('X-Variant-ID', selectedVariant.id);
    response.headers.set('X-Visitor-ID', visitorId);
    response.headers.set('X-Landing-Page', selectedVariant.landingPageSlug);
    
    console.log('Middleware: Response headers set, returning rewrite response');
    return response;
    
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin panel)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
};