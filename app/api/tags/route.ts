import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { formatErrorResponse } from '@/lib/errors';
import { eventBus, DomainEventType } from '@/lib/events/domain-events';

const TagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
});

// GET /api/tags - List all tags
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const tags = await prisma.tag.findMany({
      where: category ? { category } : undefined,
      include: {
        _count: {
          select: {
            entityTags: true,
            eventTags: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    logger.info('Tags fetched', { count: tags.length, category });
    return NextResponse.json(tags);
  } catch (error) {
    logger.error('Error fetching tags', error as Error);
    const { status, body } = formatErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: validated,
    });

    // Publish domain event
    await eventBus.publish({
      type: DomainEventType.TAG_CREATED,
      timestamp: new Date(),
      metadata: { tagId: tag.id, name: tag.name },
    });

    logger.info('Tag created', { tagId: tag.id, name: tag.name });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    logger.error('Error creating tag', error as Error);
    const { status, body } = formatErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
