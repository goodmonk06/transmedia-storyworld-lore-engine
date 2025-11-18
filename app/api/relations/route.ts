import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const RelationSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
  relationType: z.string().min(1),
  description: z.string(),
});

// GET /api/relations - List all relations with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityId = searchParams.get('entityId');

    const relations = await prisma.loreRelation.findMany({
      where: entityId
        ? {
            OR: [{ fromId: entityId }, { toId: entityId }],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        to: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(relations);
  } catch (error) {
    console.error('Error fetching relations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relations' },
      { status: 500 }
    );
  }
}

// POST /api/relations - Create a new relation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RelationSchema.parse(body);

    // Validate that both entities exist
    const [fromEntity, toEntity] = await Promise.all([
      prisma.loreEntity.findUnique({ where: { id: validated.fromId } }),
      prisma.loreEntity.findUnique({ where: { id: validated.toId } }),
    ]);

    if (!fromEntity || !toEntity) {
      return NextResponse.json(
        { error: 'One or both entities not found' },
        { status: 404 }
      );
    }

    const relation = await prisma.loreRelation.create({
      data: validated,
      include: {
        from: true,
        to: true,
      },
    });

    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating relation:', error);
    return NextResponse.json(
      { error: 'Failed to create relation' },
      { status: 500 }
    );
  }
}
