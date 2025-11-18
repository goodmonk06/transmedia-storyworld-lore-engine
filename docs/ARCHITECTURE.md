# Architecture

## Overview

The Transmedia Storyworld Lore Engine is built as a modern, scalable web application following a **layered architecture** pattern with clear separation of concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  (Next.js App Router, React Components, TailwindCSS)   │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────────────────┐
│                   API Layer                             │
│     (Next.js API Routes, Validation, Error Handling)    │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                 Service Layer                           │
│        (Business Logic, Domain Events, Adapters)        │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Data Access Layer                          │
│           (Prisma ORM, PostgreSQL Database)             │
└─────────────────────────────────────────────────────────┘

External Systems (via Adapters):
├── AI Providers (OpenAI, Anthropic, local models)
├── Search Engines (MeiliSearch, Elasticsearch)
├── Notification Services (Email, Slack, Discord)
└── Storage Services (S3, local filesystem)
```

## Directory Structure

```
transmedia-storyworld-lore-engine/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── entities/         # Entity CRUD endpoints
│   │   ├── events/           # Event CRUD endpoints
│   │   ├── relations/        # Relation CRUD endpoints
│   │   ├── projects/         # Project management endpoints
│   │   ├── tags/             # Tag management endpoints
│   │   └── export/           # Media export endpoint
│   ├── entities/             # Entity browsing UI
│   ├── timeline/             # Timeline visualization
│   ├── manage/               # Management interface
│   └── page.tsx              # Landing page
│
├── lib/                      # Shared libraries
│   ├── adapters/             # Extension interfaces
│   │   ├── ai-provider.adapter.ts
│   │   ├── notification.adapter.ts
│   │   └── search.adapter.ts
│   ├── events/               # Domain events system
│   ├── prisma.ts             # Prisma client singleton
│   ├── logger.ts             # Logging utility
│   ├── errors.ts             # Error handling
│   └── metrics.ts            # Metrics collection
│
├── prisma/                   # Database schema & migrations
│   ├── schema.prisma         # Prisma schema definition
│   └── seed.ts               # Seed data script
│
├── tests/                    # Test suites
│   ├── lib/                  # Library tests
│   ├── factories/            # Test data factories
│   └── setup.ts              # Test configuration
│
├── scripts/                  # CLI tools
│   └── cli.ts                # Command-line interface
│
└── docs/                     # Documentation
    ├── PHASE3_OVERVIEW.md
    ├── ARCHITECTURE.md
    ├── DOMAIN_NOTES.md
    └── API_REFERENCE.md
```

## Core Components

### 1. Domain Layer (Prisma Schema)

The domain model is the heart of the system, defined in `prisma/schema.prisma`:

**Core Entities:**
- **LoreEntity**: Characters, locations, artifacts, factions
- **LoreEvent**: Timeline events with temporal ordering
- **LoreRelation**: Typed relationships between entities

**Extended Entities (Phase 3):**
- **Tag**: Flexible categorization system
- **MediaProject**: Project management for different media adaptations
- **StoryArc**: Narrative arc tracking
- **Timeline**: Support for alternate timelines
- **EntityVersion**: Historical change tracking
- **EventParticipant**: Many-to-many event participation

### 2. API Layer

RESTful API built with Next.js API Routes:

**Responsibilities:**
- Request validation (Zod schemas)
- Error handling (centralized middleware)
- Logging (structured logging)
- Metrics collection
- Domain event publishing

**Patterns:**
- Standard CRUD operations for all resources
- Consistent error responses
- Typed request/response contracts
- Query parameter filtering

### 3. Service Layer

Business logic and cross-cutting concerns:

**Components:**
- **Domain Events**: Pub/sub system for decoupled side effects
- **Adapters**: Pluggable external integrations
- **Logger**: Structured logging with context
- **Metrics**: Observability and performance tracking
- **Errors**: Type-safe error handling

### 4. Frontend Layer

Server-rendered React components with Next.js:

**Pages:**
- Landing page with feature overview
- Entity browsing (list + detail views)
- Timeline visualization
- Management interface (CRUD operations)
- Media export interface

**Patterns:**
- Server Components for data fetching
- Client Components for interactivity
- TailwindCSS for styling
- Dark mode support

## Data Flow

### Read Operation (Example: Fetch Entity)

```
1. User clicks entity link
   ↓
2. Next.js server renders page component
   ↓
3. Component fetches data via Prisma
   ↓
4. PostgreSQL returns entity + relations
   ↓
5. Component renders with data
   ↓
6. HTML streamed to client
```

### Write Operation (Example: Create Entity)

```
1. User submits form (client component)
   ↓
2. POST request to /api/entities
   ↓
3. Zod validates request body
   ↓
4. Prisma creates entity in database
   ↓
5. Domain event published (EntityCreated)
   ↓
6. Event handlers execute (notifications, search indexing)
   ↓
7. Response returned to client
   ↓
8. UI updates (redirect or refetch)
```

## Extension Points

### 1. Adapters

The system uses the **Adapter Pattern** for pluggable integrations:

```typescript
interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<void>;
}

// Swap implementations without changing business logic
const adapter: INotificationAdapter =
  useSlack ? new SlackAdapter() : new EmailAdapter();
```

**Available Adapters:**
- `INotificationAdapter`: Notifications (email, Slack, Discord)
- `ISearchAdapter`: Search engines (in-memory, Elasticsearch)
- `IAIProviderAdapter`: AI providers (OpenAI, Anthropic, local)

### 2. Domain Events

The **Event Bus** enables loosely-coupled side effects:

```typescript
// Publish event
await eventBus.publish({
  type: DomainEventType.ENTITY_CREATED,
  entityId: '...',
  entityType: 'CHARACTER',
});

// Subscribe to events
eventBus.on(DomainEventType.ENTITY_CREATED, async (event) => {
  await notificationAdapter.send({
    title: 'New Entity Created',
    message: `${event.entityType}: ${event.name}`,
  });
});
```

### 3. Webhook System (Future)

Planned support for outbound webhooks to external systems.

## Scalability Considerations

### Current Scale

- **Database**: PostgreSQL (supports millions of entities)
- **API**: Single Next.js server (suitable for small-to-medium teams)
- **Search**: In-memory (suitable for < 10k entities)

### Scaling Strategies

**Horizontal Scaling:**
- Deploy multiple Next.js instances behind a load balancer
- Use read replicas for database reads
- Add Redis for caching and session management

**Vertical Scaling:**
- Increase database resources (CPU, RAM, storage)
- Use connection pooling (PgBouncer)
- Optimize queries with indexes

**External Services:**
- Move search to dedicated search engine (Elasticsearch, MeiliSearch)
- Offload media processing to background workers
- Use CDN for static assets

## Security Considerations

### Current Implementation

- **Input Validation**: Zod schemas on all API endpoints
- **SQL Injection**: Prevented via Prisma ORM (parameterized queries)
- **Error Handling**: Sensitive data not exposed in error messages

### Future Enhancements

- **Authentication**: User login system (NextAuth.js)
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: API throttling to prevent abuse
- **CSRF Protection**: Token-based protection for state-changing operations
- **Content Security Policy**: Headers to prevent XSS attacks

## Monitoring & Observability

### Logging

Structured logging with context:
```typescript
logger.info('Entity created', {
  entityId: '...',
  type: 'CHARACTER'
});
```

### Metrics

Track key performance indicators:
- API request count & duration
- Database query performance
- Entity creation rates
- Error rates

### Future: Distributed Tracing

Add OpenTelemetry for request tracing across services.

## Deployment Architecture

### Development

```
Docker Compose:
├── PostgreSQL container
├── Redis container (optional)
└── Next.js dev server (local)
```

### Production (Recommended)

```
┌─────────────────┐
│   Load Balancer │ (Nginx, Cloudflare)
└────────┬────────┘
         │
    ┌────▼────┐
    │ Next.js │ (Vercel, AWS ECS, or VPS)
    └────┬────┘
         │
    ┌────▼─────────┐
    │  PostgreSQL  │ (Managed service: Vercel Postgres, Supabase)
    └──────────────┘
```

## Technology Choices

### Why Next.js?

- **Full-stack framework**: API routes + frontend in one codebase
- **Server-side rendering**: SEO-friendly, fast initial loads
- **TypeScript first**: Type safety across the stack
- **Active ecosystem**: Large community, frequent updates

### Why Prisma?

- **Type-safe ORM**: Generated types match database schema
- **Migration system**: Version-controlled schema changes
- **Query performance**: Efficient SQL generation
- **Multi-database support**: Can switch databases if needed

### Why PostgreSQL?

- **Relational model**: Perfect for interconnected entities
- **JSON support**: Flexible metaJson fields
- **Full-text search**: Built-in search capabilities
- **Reliability**: Battle-tested, widely deployed

### Why TailwindCSS?

- **Utility-first**: Rapid UI development
- **Consistency**: Design system built-in
- **Performance**: Purges unused styles
- **Dark mode**: First-class support

## Future Architectural Improvements

1. **GraphQL Layer**: Add GraphQL API for flexible queries
2. **Event Sourcing**: Store all changes as events for audit trail
3. **CQRS**: Separate read and write models for scalability
4. **Microservices**: Split into specialized services (entity service, export service, etc.)
5. **Real-time**: WebSocket support for live collaboration

---

**Last Updated:** 2025-11-18
**Version:** 1.0.0
