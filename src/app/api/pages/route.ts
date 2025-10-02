import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single page
      const page = await prisma.landingPage.findUnique({
        where: { id }
      });

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      return NextResponse.json({ page });
    } else {
      // Get all pages
      const pages = await prisma.landingPage.findMany({
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return NextResponse.json({ pages });
    }
  } catch (error) {
    console.error('Pages API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, template, content, seoTitle, seoDescription, status } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Check if slug already exists
    const existingPage = await prisma.landingPage.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Create the page
    const page = await prisma.landingPage.create({
      data: {
        name,
        slug,
        template: template || 'custom',
        content: content || {},
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || '',
        status: status || 'DRAFT'
      }
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Create Page Error:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, template, content, seoTitle, seoDescription, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    // Update the page
    const page = await prisma.landingPage.update({
      where: { id },
      data: {
        name,
        slug,
        template,
        content,
        seoTitle,
        seoDescription,
        status
      }
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Update Page Error:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    // Delete the page
    await prisma.landingPage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Page Error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}