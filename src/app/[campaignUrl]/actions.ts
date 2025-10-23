'use server';

import { cookies } from 'next/headers';

export async function setCampaignCookies(visitorId: string, campaignId: string, variantId: string) {
  const cookieStore = cookies();
  
  // Set visitor ID cookie if not exists
  if (!cookieStore.get('visitor_id')) {
    cookieStore.set('visitor_id', visitorId, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }
  
  // Set campaign assignment cookie
  cookieStore.set(`campaign_${campaignId}`, variantId, {
    maxAge: 24 * 60 * 60, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}