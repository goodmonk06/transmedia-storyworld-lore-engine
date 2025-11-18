import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { formatErrorResponse } from '@/lib/errors';
import { eventBus, createProjectCreatedEvent } from '@/lib/events/domain-events';

const ProjectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  mediaType: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  targetAudience: z.string().optional(),
  releaseDate: z.string().datetime().optional(),
  metaJson: z.record(z.string(), z.any()).optional(),
});

// GET /api/projects - List all media projects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mediaType = searchParams.get('mediaType');
    const status = searchParams.get('status');

    const projects = await prisma.mediaProject.findMany({
      where: {
        ...(mediaType && { mediaType }),
        ...(status && { status: status as any }),
      },
      include: {
        _count: {
          select: {
            projectEntities: true,
            projectEvents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info('Projects fetched', { count: projects.length });
    return NextResponse.json(projects);
  } catch (error) {
    logger.error('Error fetching projects', error as Error);
    const { status, body } = formatErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

// POST /api/projects - Create a new media project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ProjectSchema.parse(body);

    const data: any = { ...validated };
    if (validated.releaseDate) {
      data.releaseDate = new Date(validated.releaseDate);
    }

    const project = await prisma.mediaProject.create({
      data,
      include: {
        _count: {
          select: {
            projectEntities: true,
            projectEvents: true,
          },
        },
      },
    });

    // Publish domain event
    await eventBus.publish(
      createProjectCreatedEvent(project.id, project.name, project.mediaType)
    );

    logger.info('Project created', { projectId: project.id, name: project.name });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    logger.error('Error creating project', error as Error);
    const { status, body } = formatErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
