import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all DataLayer events
export async function GET(request: NextRequest) {
  try {
    const events = await prisma.dataLayerEvent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { fires: true }
        }
      }
    });

    const formattedEvents = events.map(event => ({
      id: event.id.toString(),
      event_name: event.eventName,
      description: event.description,
      parameters: typeof event.parameters === 'string' ? JSON.parse(event.parameters) : event.parameters,
      trigger_condition: event.triggerCondition,
      status: event.status,
      created_at: event.createdAt.toISOString().split('T')[0],
      fire_count: event._count.fires
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching DataLayer events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create new DataLayer event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_name,
      description,
      parameters,
      trigger_condition,
      status = 'active'
    } = body;

    if (!event_name || !description || !trigger_condition) {
      return NextResponse.json(
        { error: 'Missing required fields: event_name, description, trigger_condition' },
        { status: 400 }
      );
    }

    const event = await prisma.dataLayerEvent.create({
      data: {
        eventName: event_name,
        description,
        parameters: typeof parameters === 'string' ? parameters : JSON.stringify(parameters),
        triggerCondition: trigger_condition,
        status,
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'DataLayer event created successfully',
      data: {
        id: event.id.toString(),
        event_name: event.eventName,
        description: event.description,
        parameters: event.parameters,
        trigger_condition: event.triggerCondition,
        status: event.status,
        created_at: event.createdAt.toISOString().split('T')[0],
        fire_count: 0
      }
    });
  } catch (error) {
    console.error('Error creating DataLayer event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PUT - Update DataLayer event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const event = await prisma.dataLayerEvent.update({
      where: { id: parseInt(id) },
      data: {
        ...(updateData.event_name && { eventName: updateData.event_name }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.parameters && { 
          parameters: typeof updateData.parameters === 'string' 
            ? JSON.parse(updateData.parameters) 
            : updateData.parameters 
        }),
        ...(updateData.trigger_condition && { triggerCondition: updateData.trigger_condition }),
        ...(updateData.status && { status: updateData.status }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'DataLayer event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating DataLayer event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete DataLayer event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Delete related fires first
    await prisma.eventFire.deleteMany({
      where: { eventId: parseInt(id) }
    });

    // Delete the event
    await prisma.dataLayerEvent.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'DataLayer event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting DataLayer event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}