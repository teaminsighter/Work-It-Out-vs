import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all leads
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Simple duplicate detection based on email and phone
    const duplicateGroups: any[] = [];
    const processedLeads = new Set();
    
    for (let i = 0; i < leads.length; i++) {
      const lead1 = leads[i];
      
      if (processedLeads.has(lead1.id)) continue;
      
      const duplicates = [lead1];
      const duplicateReasons: string[] = [];
      
      // Find duplicates
      for (let j = i + 1; j < leads.length; j++) {
        const lead2 = leads[j];
        
        if (processedLeads.has(lead2.id)) continue;
        
        let isDuplicate = false;
        const reasons: string[] = [];
        
        // Check email match
        if (lead1.email && lead2.email && lead1.email.toLowerCase() === lead2.email.toLowerCase()) {
          isDuplicate = true;
          reasons.push('Same email address');
        }
        
        // Check phone match
        if (lead1.phone && lead2.phone && lead1.phone.replace(/\D/g, '') === lead2.phone.replace(/\D/g, '')) {
          isDuplicate = true;
          reasons.push('Same phone number');
        }
        
        // Check similar names (basic similarity)
        if (lead1.fullName && lead2.fullName) {
          const name1 = lead1.fullName.toLowerCase().replace(/\s+/g, ' ').trim();
          const name2 = lead2.fullName.toLowerCase().replace(/\s+/g, ' ').trim();
          if (name1 === name2) {
            isDuplicate = true;
            reasons.push('Same name');
          }
        }
        
        if (isDuplicate) {
          duplicates.push(lead2);
          duplicateReasons.push(...reasons);
          processedLeads.add(lead2.id);
        }
      }
      
      // Only add to groups if we found duplicates
      if (duplicates.length > 1) {
        duplicateGroups.push({
          id: `group_${duplicateGroups.length + 1}`,
          leads: duplicates.map(lead => ({
            id: lead.id.toString(),
            name: lead.fullName || 'Unknown',
            email: lead.email || '',
            phone: lead.phone || '',
            address: lead.address || '',
            createdAt: lead.createdAt.toISOString(),
            source: 'Form Submission',
            status: 'lead',
            estimatedValue: 0,
            duplicateGroup: `group_${duplicateGroups.length + 1}`,
            confidence: duplicateReasons.includes('Same email address') ? 95 : 
                       duplicateReasons.includes('Same phone number') ? 85 : 70,
            duplicateReasons: [...new Set(duplicateReasons)]
          })),
          primaryLead: {
            id: lead1.id.toString(),
            name: lead1.fullName || 'Unknown',
            email: lead1.email || '',
            phone: lead1.phone || '',
            address: lead1.address || '',
            createdAt: lead1.createdAt.toISOString(),
            source: 'Form Submission',
            status: 'lead',
            estimatedValue: 0,
            duplicateGroup: `group_${duplicateGroups.length + 1}`,
            confidence: 95,
            duplicateReasons: [...new Set(duplicateReasons)]
          },
          duplicateCount: duplicates.length,
          totalValue: 0,
          duplicateReasons: [...new Set(duplicateReasons)],
          confidence: duplicateReasons.includes('Same email address') ? 95 : 
                     duplicateReasons.includes('Same phone number') ? 85 : 70
        });
        
        processedLeads.add(lead1.id);
      }
    }

    return NextResponse.json(duplicateGroups);
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return NextResponse.json({ error: 'Failed to detect duplicates' }, { status: 500 });
  }
}