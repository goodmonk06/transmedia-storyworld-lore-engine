/**
 * Notification Adapter Interface
 * Allows plugging in different notification providers (email, Slack, Discord, etc.)
 */

export enum NotificationType {
  ENTITY_CREATED = 'entity_created',
  ENTITY_UPDATED = 'entity_updated',
  ENTITY_DELETED = 'entity_deleted',
  EVENT_CREATED = 'event_created',
  PROJECT_CREATED = 'project_created',
  CUSTOM = 'custom',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  recipients?: string[];
}

export interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<void>;
  sendBatch(payloads: NotificationPayload[]): Promise<void>;
}

/**
 * In-memory (no-op) implementation
 */
export class InMemoryNotificationAdapter implements INotificationAdapter {
  private notifications: NotificationPayload[] = [];

  async send(payload: NotificationPayload): Promise<void> {
    this.notifications.push(payload);
    console.log('[Notification]', payload.title, payload.message);
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload);
    }
  }

  getAll(): NotificationPayload[] {
    return this.notifications;
  }

  clear() {
    this.notifications = [];
  }
}

/**
 * Console logger implementation (useful for development)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    console.log('========== NOTIFICATION ==========');
    console.log(`Type: ${payload.type}`);
    console.log(`Title: ${payload.title}`);
    console.log(`Message: ${payload.message}`);
    if (payload.recipients) {
      console.log(`Recipients: ${payload.recipients.join(', ')}`);
    }
    if (payload.metadata) {
      console.log(`Metadata:`, payload.metadata);
    }
    console.log('==================================');
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload);
    }
  }
}

// Default adapter (console in development, should be replaced in production)
export const notificationAdapter: INotificationAdapter =
  process.env.NODE_ENV === 'production'
    ? new InMemoryNotificationAdapter()
    : new ConsoleNotificationAdapter();
