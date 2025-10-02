import { NextRequest, NextResponse } from 'next/server';
import { pageManager } from '@/lib/pageManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (id) {
      const page = pageManager.getPage(id);
      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }
      return NextResponse.json({ page });
    } else if (slug) {
      const page = pageManager.getPageBySlug(slug);
      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }
      return NextResponse.json({ page });
    } else {
      const pages = pageManager.getAllPages();
      return NextResponse.json({ pages });
    }
  } catch (error) {
    console.error('Page Manager API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        const created = pageManager.createPage(data);
        if (!created) {
          return NextResponse.json({ error: 'Page already exists or invalid data' }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Page created successfully' });

      case 'update':
        const { id, updates } = data;
        const updated = pageManager.updatePage(id, updates);
        if (!updated) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Page updated successfully' });

      case 'clone':
        const { sourceId, newId, newName } = data;
        const cloned = pageManager.clonePage(sourceId, newId, newName);
        if (!cloned) {
          return NextResponse.json({ error: 'Failed to clone page' }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Page cloned successfully' });

      case 'update-component':
        const { pageId, componentType, componentUpdates } = data;
        const componentUpdated = pageManager.updateComponent(pageId, componentType, componentUpdates);
        if (!componentUpdated) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Component updated successfully' });

      case 'update-analytics':
        const { pageId: analyticsPageId, analytics } = data;
        const analyticsUpdated = pageManager.updateAnalytics(analyticsPageId, analytics);
        if (!analyticsUpdated) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Analytics updated successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Page Manager API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    const deleted = pageManager.deletePage(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Page Manager API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}