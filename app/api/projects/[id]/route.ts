import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { formatErrorResponse, createNotFoundError } from '@/lib/errors';

const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  targetAudience: z.string().optional(),
  releaseDate: z.string().datetime().optional().nullable(),
  metaJson: z.record(z.string(), z.any()).optional(),
});

// GET /api/projects/:id - Get a single project with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.mediaProject.findUnique({
      where: { id },
      include: {
        projectEntities: {
          include: {
            entity: {
              select: {
                id: true,
                name: true,
                type: true,
                summaryMarkdown: true,
              },
            },
          },
        },
        projectEvents: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                occurredAt: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!project) {
      throw createNotFoundError('Project', id);
    }

    logger.info('Project fetched', { projectId: id });
    return NextResponse.json(project);
  } catch (error) {
    logger.error('Error fetching project', error as Error);
    const { status, body } = formatErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

// PUT /api/projects/:id - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = ProjectUpdateSchema.parse(body);

    const data: any = { ...validated };
    if (validated.releaseDate) {
      data.releaseDate = new Date(validated.releaseDate);
    }

    const project = await prisma.mediaProject.update({
      where: { id },
      data,
    });

    logger.info('Project updated', { projectId: id });
    return NextResponse.json(project);
  } catch (error) {
    logger.error('Error updating project', error as Error);
    const { status, body } = formatErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

// DELETE /api/projects/:id - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.mediaProject.delete({
      where: { id },
    });

    logger.info('Project deleted', { projectId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting project', error as Error);
    const { status, body } = formatErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
