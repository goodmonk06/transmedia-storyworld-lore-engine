import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const MEDIA_TEMPLATES = {
  novel: {
    prompt: `Create a novel-friendly character pitch that includes:
- Rich character description with personality traits
- Key relationships and conflicts
- Character arc potential
- Narrative hooks for storytelling`,
  },
  video: {
    prompt: `Create a video/visual media pitch that includes:
- Visual description (appearance, mannerisms)
- Key dramatic moments
- Cinematic potential
- Emotional beats`,
  },
  game: {
    prompt: `Create a game design pitch that includes:
- Player interaction opportunities
- Abilities or special traits
- Quest or mission potential
- Gameplay mechanics suggestions`,
  },
};

// POST /api/export - Generate a media-specific summary for an entity
export async function POST(request: NextRequest) {
  try {
    const { entityId, targetMedia } = await request.json();

    if (!entityId || !targetMedia) {
      return NextResponse.json(
        { error: 'entityId and targetMedia are required' },
        { status: 400 }
      );
    }

    if (!['novel', 'video', 'game'].includes(targetMedia)) {
      return NextResponse.json(
        { error: 'targetMedia must be one of: novel, video, game' },
        { status: 400 }
      );
    }

    // Fetch the entity with all related data
    const entity = await prisma.loreEntity.findUnique({
      where: { id: entityId },
      include: {
        eventsAtLocation: {
          orderBy: { occurredAt: 'asc' },
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

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      );
    }

    // Try to use OpenAI if API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    let summary: string;

    if (openaiKey && openaiKey !== 'your-openai-api-key-here') {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const template = MEDIA_TEMPLATES[targetMedia as keyof typeof MEDIA_TEMPLATES];

        const relationsSummary = [
          ...entity.relationsFrom.map(
            (r) => `${r.relationType} → ${r.to.name} (${r.to.type}): ${r.description}`
          ),
          ...entity.relationsTo.map(
            (r) => `${r.from.name} (${r.from.type}) → ${r.relationType}: ${r.description}`
          ),
        ].join('\n');

        const eventsSummary =
          entity.type === 'LOCATION'
            ? `Events at this location:\n${entity.eventsAtLocation
                .map((e) => `- ${e.title} (${e.occurredAt.toISOString()})`)
                .join('\n')}`
            : '';

        const prompt = `Entity Information:
Name: ${entity.name}
Type: ${entity.type}
Summary: ${entity.summaryMarkdown}

${relationsSummary ? `Relationships:\n${relationsSummary}\n` : ''}
${eventsSummary}

${template.prompt}

Format: Provide a concise 2-3 paragraph pitch suitable for ${targetMedia} development.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a creative writer adapting storyworld lore for different media formats.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        summary = completion.choices[0].message.content || 'Failed to generate summary';
      } catch (error) {
        console.error('OpenAI API error:', error);
        summary = generateTemplateSummary(entity, targetMedia);
      }
    } else {
      // Fallback to template-based summary
      summary = generateTemplateSummary(entity, targetMedia);
    }

    return NextResponse.json({
      entityId,
      entityName: entity.name,
      targetMedia,
      summary,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

function generateTemplateSummary(entity: any, targetMedia: string): string {
  const relationsSummary = [
    ...entity.relationsFrom.map(
      (r: any) => `${r.relationType} with ${r.to.name}`
    ),
    ...entity.relationsTo.map(
      (r: any) => `${r.from.name}'s ${r.relationType}`
    ),
  ].join(', ');

  if (targetMedia === 'novel') {
    return `**${entity.name}** (${entity.type})\n\n${entity.summaryMarkdown}\n\nKey relationships: ${relationsSummary || 'None yet'}.\n\nThis ${entity.type.toLowerCase()} offers rich narrative potential with deep connections to the storyworld's lore and conflicts.`;
  } else if (targetMedia === 'video') {
    return `**${entity.name}** - Visual Concept\n\n${entity.summaryMarkdown}\n\nVisual hooks: This ${entity.type.toLowerCase()} presents strong visual storytelling opportunities. Relationships: ${relationsSummary || 'None yet'}.\n\nCinematic moments can be crafted around key events and dramatic tensions.`;
  } else {
    // game
    return `**${entity.name}** - Game Design Pitch\n\n${entity.summaryMarkdown}\n\nGameplay integration: This ${entity.type.toLowerCase()} can serve as ${
      entity.type === 'CHARACTER' ? 'an NPC, quest giver, or companion' : entity.type === 'LOCATION' ? 'a playable area or hub' : 'a collectible or quest item'
    }.\n\nRelationships: ${relationsSummary || 'None yet'}.`;
  }
}
