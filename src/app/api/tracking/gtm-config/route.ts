import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch GTM configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const containerId = searchParams.get('containerId');

    if (containerId) {
      // Get specific container
      const container = await prisma.gTMContainer.findUnique({
        where: { containerId },
        include: {
          tags: true,
          triggers: true,
          variables: true
        }
      });

      if (!container) {
        return NextResponse.json(
          { error: 'Container not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        container: {
          id: container.id.toString(),
          name: container.name,
          containerId: container.containerId,
          accountId: container.accountId,
          status: container.status,
          lastPublished: container.lastPublished?.toISOString(),
          version: container.version,
          triggers: container.triggers.length,
          tags: container.tags.length,
          variables: container.variables.length
        },
        tags: container.tags.map(tag => ({
          id: tag.id.toString(),
          name: tag.name,
          type: tag.type,
          status: tag.status,
          triggers: tag.triggers as string[],
          firingCount: tag.firingCount || 0
        })),
        installationCode: generateInstallationCode(container.containerId)
      });
    } else {
      // Get all containers
      const containers = await prisma.gTMContainer.findMany({
        include: {
          _count: {
            select: {
              tags: true,
              triggers: true,
              variables: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formattedContainers = containers.map(container => ({
        id: container.id.toString(),
        name: container.name,
        containerId: container.containerId,
        accountId: container.accountId,
        status: container.status,
        lastPublished: container.lastPublished?.toISOString(),
        version: container.version,
        triggers: container._count.triggers,
        tags: container._count.tags,
        variables: container._count.variables
      }));

      return NextResponse.json({ containers: formattedContainers });
    }
  } catch (error) {
    console.error('Error fetching GTM config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GTM configuration' },
      { status: 500 }
    );
  }
}

// POST - Create or sync GTM container
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      containerId,
      accountId,
      name,
      authToken, // Google API token for syncing
      syncFromGTM = false
    } = body;

    if (!containerId || !name) {
      return NextResponse.json(
        { error: 'Container ID and name are required' },
        { status: 400 }
      );
    }

    let containerData: any = {
      containerId,
      accountId: accountId || '',
      name,
      status: 'active',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // If syncing from GTM and auth token provided
    if (syncFromGTM && authToken) {
      try {
        const gtmData = await syncFromGoogleGTM(containerId, authToken);
        containerData = { ...containerData, ...gtmData };
      } catch (syncError) {
        console.error('GTM sync error:', syncError);
        // Continue with manual creation if sync fails
      }
    }

    // Check if container already exists
    const existingContainer = await prisma.gTMContainer.findUnique({
      where: { containerId }
    });

    let container;
    if (existingContainer) {
      container = await prisma.gTMContainer.update({
        where: { containerId },
        data: {
          ...containerData,
          updatedAt: new Date()
        }
      });
    } else {
      container = await prisma.gTMContainer.create({
        data: containerData
      });
    }

    return NextResponse.json({
      success: true,
      message: syncFromGTM ? 'Container synced successfully' : 'Container created successfully',
      data: {
        id: container.id.toString(),
        name: container.name,
        containerId: container.containerId,
        accountId: container.accountId,
        status: container.status,
        version: container.version
      }
    });
  } catch (error) {
    console.error('Error creating/syncing GTM container:', error);
    return NextResponse.json(
      { error: 'Failed to create/sync container' },
      { status: 500 }
    );
  }
}

// PUT - Update GTM container configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Container ID is required' },
        { status: 400 }
      );
    }

    const container = await prisma.gTMContainer.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Container updated successfully',
      data: container
    });
  } catch (error) {
    console.error('Error updating GTM container:', error);
    return NextResponse.json(
      { error: 'Failed to update container' },
      { status: 500 }
    );
  }
}

// Helper function to sync from Google GTM API
async function syncFromGoogleGTM(containerId: string, authToken: string) {
  const apiUrl = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/*/containers/${containerId}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`GTM API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    name: data.name,
    accountId: data.accountId,
    lastPublished: new Date(data.fingerprint),
    version: parseInt(data.tagManagerUrl?.match(/version\/(\d+)/)?.[1] || '1')
  };
}

// Helper function to generate installation code
function generateInstallationCode(containerId: string): string {
  return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
}