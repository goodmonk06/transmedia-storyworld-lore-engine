/**
 * Domain Events System
 * Provides typed events for all domain mutations
 */

export enum DomainEventType {
  // Entity events
  ENTITY_CREATED = 'entity.created',
  ENTITY_UPDATED = 'entity.updated',
  ENTITY_DELETED = 'entity.deleted',
  ENTITY_PUBLISHED = 'entity.published',
  ENTITY_ARCHIVED = 'entity.archived',

  // Event events
  EVENT_CREATED = 'event.created',
  EVENT_UPDATED = 'event.updated',
  EVENT_DELETED = 'event.deleted',

  // Relation events
  RELATION_CREATED = 'relation.created',
  RELATION_DELETED = 'relation.deleted',

  // Project events
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  ENTITY_ADDED_TO_PROJECT = 'project.entity_added',
  EVENT_ADDED_TO_PROJECT = 'project.event_added',

  // Tag events
  TAG_CREATED = 'tag.created',
  ENTITY_TAGGED = 'entity.tagged',
  EVENT_TAGGED = 'event.tagged',

  // Story arc events
  ARC_CREATED = 'arc.created',
  ARC_UPDATED = 'arc.updated',
}

export interface BaseDomainEvent {
  type: DomainEventType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface EntityCreatedEvent extends BaseDomainEvent {
  type: DomainEventType.ENTITY_CREATED;
  entityId: string;
  entityType: string;
  name: string;
}

export interface EntityUpdatedEvent extends BaseDomainEvent {
  type: DomainEventType.ENTITY_UPDATED;
  entityId: string;
  changes: Record<string, any>;
}

export interface EntityDeletedEvent extends BaseDomainEvent {
  type: DomainEventType.ENTITY_DELETED;
  entityId: string;
  entityType: string;
}

export interface ProjectCreatedEvent extends BaseDomainEvent {
  type: DomainEventType.PROJECT_CREATED;
  projectId: string;
  name: string;
  mediaType: string;
}

export interface EntityTaggedEvent extends BaseDomainEvent {
  type: DomainEventType.ENTITY_TAGGED;
  entityId: string;
  tagId: string;
  tagName: string;
}

export type DomainEvent =
  | EntityCreatedEvent
  | EntityUpdatedEvent
  | EntityDeletedEvent
  | ProjectCreatedEvent
  | EntityTaggedEvent
  | BaseDomainEvent;

/**
 * Event handler type
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

/**
 * Event bus for publishing and subscribing to domain events
 */
class EventBus {
  private handlers: Map<DomainEventType, EventHandler[]> = new Map();
  private wildcardHandlers: EventHandler[] = [];

  /**
   * Subscribe to a specific event type
   */
  on<T extends DomainEvent>(type: DomainEventType, handler: EventHandler<T>) {
    const existing = this.handlers.get(type) || [];
    existing.push(handler as EventHandler);
    this.handlers.set(type, existing);
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler) {
    this.wildcardHandlers.push(handler);
  }

  /**
   * Unsubscribe from a specific event type
   */
  off(type: DomainEventType, handler: EventHandler) {
    const existing = this.handlers.get(type) || [];
    const filtered = existing.filter((h) => h !== handler);
    this.handlers.set(type, filtered);
  }

  /**
   * Publish an event
   */
  async publish(event: DomainEvent) {
    // Call type-specific handlers
    const typeHandlers = this.handlers.get(event.type) || [];
    for (const handler of typeHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }

    // Call wildcard handlers
    for (const handler of this.wildcardHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in wildcard event handler:`, error);
      }
    }
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear() {
    this.handlers.clear();
    this.wildcardHandlers = [];
  }
}

export const eventBus = new EventBus();

/**
 * Helper to create and publish events
 */
export function createEntityCreatedEvent(
  entityId: string,
  entityType: string,
  name: string
): EntityCreatedEvent {
  return {
    type: DomainEventType.ENTITY_CREATED,
    timestamp: new Date(),
    entityId,
    entityType,
    name,
  };
}

export function createEntityUpdatedEvent(
  entityId: string,
  changes: Record<string, any>
): EntityUpdatedEvent {
  return {
    type: DomainEventType.ENTITY_UPDATED,
    timestamp: new Date(),
    entityId,
    changes,
  };
}

export function createProjectCreatedEvent(
  projectId: string,
  name: string,
  mediaType: string
): ProjectCreatedEvent {
  return {
    type: DomainEventType.PROJECT_CREATED,
    timestamp: new Date(),
    projectId,
    name,
    mediaType,
  };
}
