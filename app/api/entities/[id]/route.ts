import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const EntityUpdateSchema = z.object({
  type: z.enum(['CHARACTER', 'LOCATION', 'ARTIFACT', 'FACTION', 'OTHER']).optional(),
  name: z.string().min(1).optional(),
  summaryMarkdown: z.string().optional(),
  metaJson: z.record(z.string(), z.any()).optional(),
});

// GET /api/entities/:id - Get a single entity with full relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entity = await prisma.loreEntity.findUnique({
      where: { id },
      include: {
        eventsAtLocation: {
          orderBy: { occurredAt: 'asc' },
        },
        relationsFrom: {
          include: {
            to: true,
          },
        },
        relationsTo: {
          include: {
            from: true,
          },
        },
      },
    });

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entity);
  } catch (error) {
    console.error('Error fetching entity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entity' },
      { status: 500 }
    );
  }
}

// PUT /api/entities/:id - Update an entity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = EntityUpdateSchema.parse(body);

    const entity = await prisma.loreEntity.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(entity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating entity:', error);
    return NextResponse.json(
      { error: 'Failed to update entity' },
      { status: 500 }
    );
  }
}

// DELETE /api/entities/:id - Delete an entity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.loreEntity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entity:', error);
    return NextResponse.json(
      { error: 'Failed to delete entity' },
      { status: 500 }
    );
  }
}
