import { EntityType } from '@prisma/client';

export function createEntityData(overrides?: Partial<{
  type: EntityType;
  name: string;
  summaryMarkdown: string;
  metaJson: Record<string, any>;
}>) {
  return {
    type: overrides?.type || 'CHARACTER' as EntityType,
    name: overrides?.name || 'Test Entity',
    summaryMarkdown: overrides?.summaryMarkdown || 'A test entity description.',
    metaJson: overrides?.metaJson || {},
  };
}

export function createEventData(overrides?: Partial<{
  title: string;
  descriptionMarkdown: string;
  occurredAt: Date;
  locationId: string | null;
  metaJson: Record<string, any>;
}>) {
  return {
    title: overrides?.title || 'Test Event',
    descriptionMarkdown: overrides?.descriptionMarkdown || 'A test event description.',
    occurredAt: overrides?.occurredAt || new Date('2023-01-01'),
    locationId: overrides?.locationId || null,
    metaJson: overrides?.metaJson || {},
  };
}

export function createRelationData(overrides?: Partial<{
  fromId: string;
  toId: string;
  relationType: string;
  description: string;
}>) {
  return {
    fromId: overrides?.fromId || 'entity-1',
    toId: overrides?.toId || 'entity-2',
    relationType: overrides?.relationType || 'knows',
    description: overrides?.description || 'Test relation description.',
  };
}
