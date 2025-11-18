import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EntityType } from '@prisma/client';
import { z } from 'zod';

const EntitySchema = z.object({
  type: z.enum(['CHARACTER', 'LOCATION', 'ARTIFACT', 'FACTION', 'OTHER']),
  name: z.string().min(1),
  summaryMarkdown: z.string(),
  metaJson: z.record(z.string(), z.any()).optional(),
});

// GET /api/entities - List all entities with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as EntityType | null;

    const entities = await prisma.loreEntity.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        eventsAtLocation: {
          select: {
            id: true,
            title: true,
            occurredAt: true,
          },
        },
        relationsFrom: {
          include: {
            to: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        relationsTo: {
          include: {
            from: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}

// POST /api/entities - Create a new entity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = EntitySchema.parse(body);

    const entity = await prisma.loreEntity.create({
      data: validated,
    });

    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating entity:', error);
    return NextResponse.json(
      { error: 'Failed to create entity' },
      { status: 500 }
    );
  }
}
