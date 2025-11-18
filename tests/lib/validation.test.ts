import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test validation schemas
const EntityTypeSchema = z.enum(['CHARACTER', 'LOCATION', 'ARTIFACT', 'FACTION', 'OTHER']);

const EntitySchema = z.object({
  type: EntityTypeSchema,
  name: z.string().min(1),
  summaryMarkdown: z.string(),
  metaJson: z.record(z.string(), z.any()).optional(),
});

const EventSchema = z.object({
  title: z.string().min(1),
  descriptionMarkdown: z.string(),
  occurredAt: z.date(),
  locationId: z.string().optional().nullable(),
  metaJson: z.record(z.string(), z.any()).optional(),
});

describe('Validation Schemas', () => {
  describe('EntitySchema', () => {
    it('should validate a correct entity', () => {
      const entity = {
        type: 'CHARACTER',
        name: 'Test Character',
        summaryMarkdown: 'A test character',
      };

      expect(() => EntitySchema.parse(entity)).not.toThrow();
    });

    it('should reject entity without name', () => {
      const entity = {
        type: 'CHARACTER',
        summaryMarkdown: 'A test character',
      };

      expect(() => EntitySchema.parse(entity)).toThrow();
    });

    it('should reject entity with empty name', () => {
      const entity = {
        type: 'CHARACTER',
        name: '',
        summaryMarkdown: 'A test character',
      };

      expect(() => EntitySchema.parse(entity)).toThrow();
    });

    it('should reject entity with invalid type', () => {
      const entity = {
        type: 'INVALID_TYPE',
        name: 'Test',
        summaryMarkdown: 'Description',
      };

      expect(() => EntitySchema.parse(entity)).toThrow();
    });

    it('should accept entity with metaJson', () => {
      const entity = {
        type: 'CHARACTER',
        name: 'Test',
        summaryMarkdown: 'Description',
        metaJson: { age: 30, species: 'human' },
      };

      expect(() => EntitySchema.parse(entity)).not.toThrow();
    });
  });

  describe('EventSchema', () => {
    it('should validate a correct event', () => {
      const event = {
        title: 'Test Event',
        descriptionMarkdown: 'A test event',
        occurredAt: new Date('2023-01-01'),
      };

      expect(() => EventSchema.parse(event)).not.toThrow();
    });

    it('should reject event without title', () => {
      const event = {
        descriptionMarkdown: 'A test event',
        occurredAt: new Date('2023-01-01'),
      };

      expect(() => EventSchema.parse(event)).toThrow();
    });

    it('should accept event with locationId', () => {
      const event = {
        title: 'Test Event',
        descriptionMarkdown: 'A test event',
        occurredAt: new Date('2023-01-01'),
        locationId: 'location-123',
      };

      expect(() => EventSchema.parse(event)).not.toThrow();
    });

    it('should accept event with null locationId', () => {
      const event = {
        title: 'Test Event',
        descriptionMarkdown: 'A test event',
        occurredAt: new Date('2023-01-01'),
        locationId: null,
      };

      expect(() => EventSchema.parse(event)).not.toThrow();
    });
  });
});
