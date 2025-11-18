import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const EventSchema = z.object({
  title: z.string().min(1),
  descriptionMarkdown: z.string(),
  occurredAt: z.string().datetime(),
  locationId: z.string().optional().nullable(),
  metaJson: z.record(z.string(), z.any()).optional(),
});

// GET /api/events - List all events with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');
    const entityId = searchParams.get('entityId');

    const events = await prisma.loreEvent.findMany({
      where: {
        AND: [
          locationId ? { locationId } : {},
          // If entityId is provided, find events at locations related to that entity
          // This is a simplified version - you might want more complex filtering
        ],
      },
      orderBy: { occurredAt: 'asc' },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = EventSchema.parse(body);

    const event = await prisma.loreEvent.create({
      data: {
        ...validated,
        occurredAt: new Date(validated.occurredAt),
      },
      include: {
        location: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
