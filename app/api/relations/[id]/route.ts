import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const RelationUpdateSchema = z.object({
  relationType: z.string().min(1).optional(),
  description: z.string().optional(),
});

// GET /api/relations/:id - Get a single relation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const relation = await prisma.loreRelation.findUnique({
      where: { id },
      include: {
        from: true,
        to: true,
      },
    });

    if (!relation) {
      return NextResponse.json(
        { error: 'Relation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(relation);
  } catch (error) {
    console.error('Error fetching relation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relation' },
      { status: 500 }
    );
  }
}

// PUT /api/relations/:id - Update a relation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = RelationUpdateSchema.parse(body);

    const relation = await prisma.loreRelation.update({
      where: { id },
      data: validated,
      include: {
        from: true,
        to: true,
      },
    });

    return NextResponse.json(relation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating relation:', error);
    return NextResponse.json(
      { error: 'Failed to update relation' },
      { status: 500 }
    );
  }
}

// DELETE /api/relations/:id - Delete a relation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.loreRelation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting relation:', error);
    return NextResponse.json(
      { error: 'Failed to delete relation' },
      { status: 500 }
    );
  }
}
