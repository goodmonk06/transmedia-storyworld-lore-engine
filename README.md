# Transmedia Storyworld Lore Engine

A comprehensive web application for building, exploring, and exporting storyworld lore across different media formats. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Entity Management**: Create and organize characters, locations, artifacts, factions, and other story elements
- **Timeline View**: Visualize events chronologically to understand how your storyworld unfolds
- **Relationship Mapping**: Define and explore complex relationships between entities
- **Media Export**: Generate tailored summaries for novels, video/film, and games using AI
- **Full CRUD Operations**: Complete REST API for programmatic access
- **Sample Storyworld**: Pre-loaded vertical slice demonstrating the system's capabilities

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI GPT-4o-mini for media-specific summaries
- **Validation**: Zod schemas
- **Rendering**: React Markdown for formatted content

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or remote)
- OpenAI API key (optional, for AI-powered exports)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd transmedia-storyworld-lore-engine
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key (optional)

### Database Setup

1. Push the schema to your database:
```bash
npm run db:push
```

2. Seed the database with sample data:
```bash
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Domain Model

### Core Entities

#### LoreEntity
The fundamental building block of your storyworld.

```typescript
{
  id: string              // Unique identifier
  type: EntityType        // CHARACTER, LOCATION, ARTIFACT, FACTION, OTHER
  name: string            // Display name
  summaryMarkdown: string // Detailed description (supports Markdown)
  metaJson: object        // Flexible metadata (species, age, etc.)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Use Cases:**
- **CHARACTER**: Protagonists, antagonists, supporting characters, NPCs
- **LOCATION**: Cities, landmarks, regions, buildings, secret hideouts
- **ARTIFACT**: Magical items, technology, important objects, relics
- **FACTION**: Organizations, guilds, governments, secret societies
- **OTHER**: Concepts, phenomena, species, or anything else

#### LoreEvent
Temporal occurrences that shape your narrative.

```typescript
{
  id: string
  title: string
  descriptionMarkdown: string
  occurredAt: DateTime        // When the event happened
  locationId: string | null   // Where it happened (optional)
  metaJson: object            // Additional context
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Best Practices:**
- Use consistent date formats for your storyworld's timeline
- Link events to locations when relevant for spatial context
- Use metaJson to track event types (battle, discovery, political, etc.)

#### LoreRelation
Connections between entities that define your storyworld's structure.

```typescript
{
  id: string
  fromId: string         // Source entity
  toId: string           // Target entity
  relationType: string   // Nature of the relationship
  description: string    // Context and details
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relationship Examples:**
- Character → Character: `mentor`, `rival`, `sibling`, `enemy`, `ally`
- Character → Location: `resides_at`, `seeks`, `guards`, `rules`
- Character → Artifact: `wields`, `seeks`, `created`, `cursed_by`
- Faction → Location: `controls`, `threatens`, `explores`
- Location → Location: `connected_to`, `hidden_within`, `overlooks`

## Modeling Different IP Types

### Fantasy Novel

**Focus on:**
- Rich character backstories and motivations
- Detailed location descriptions with sensory details
- Artifact lore and histories
- Complex relationship networks
- Timeline of historical events

**Example Structure:**
```
Characters: Protagonists, antagonists, mentors, companions
Locations: Kingdoms, cities, dungeons, mystical places
Artifacts: Magical weapons, ancient tomes, cursed items
Factions: Guilds, kingdoms, secret orders
Events: Battles, discoveries, prophecies, political shifts
```

### Sci-Fi Universe

**Focus on:**
- Technology artifacts and their capabilities
- Planetary/station locations with cultural details
- Faction ideologies and conflicts
- Timeline of technological advancement
- Character specializations and roles

**Example Structure:**
```
Characters: Scientists, pilots, soldiers, politicians
Locations: Planets, space stations, ships, colonies
Artifacts: Tech devices, AI systems, experimental weapons
Factions: Corporations, governments, rebel groups
Events: First contact, wars, discoveries, collapses
```

### Superhero World

**Focus on:**
- Character powers and origin stories
- Key battle locations and territories
- Power sources (artifacts)
- Hero/villain organizations
- Timeline of major events and crises

**Example Structure:**
```
Characters: Heroes, villains, civilians, mentors
Locations: Cities, secret bases, other dimensions
Artifacts: Power sources, devices, weapons
Factions: Hero teams, villain leagues, agencies
Events: Origin events, battles, team formations
```

### Horror/Mystery Setting

**Focus on:**
- Atmospheric location descriptions
- Character connections and secrets
- Cursed/mysterious artifacts
- Timeline of disappearances/incidents
- Hidden relationships and revelations

**Example Structure:**
```
Characters: Investigators, victims, suspects, entities
Locations: Haunted places, crime scenes, safe havens
Artifacts: Cursed objects, evidence, clues
Factions: Secret societies, cults, institutions
Events: Disappearances, discoveries, confrontations
```

### Game World

**Focus on:**
- Gameplay-relevant entity metadata
- Quest-giving characters and NPCs
- Explorable locations with clear purposes
- Collectible/usable artifacts
- Event chains that form quest lines

**Example Structure:**
```
Characters: NPCs (roles: merchant, quest-giver, boss, companion)
Locations: Levels, hubs, dungeons (with gameplay purposes)
Artifacts: Weapons, consumables, quest items
Factions: Joinable guilds, enemy factions
Events: Quest milestones, unlockable content
```

## Media Export Feature

The media export endpoint generates tailored summaries for different formats:

### Novel Format
- Rich character descriptions with personality traits
- Key relationships and conflicts
- Character arc potential
- Narrative hooks

### Video/Film Format
- Visual descriptions (appearance, mannerisms)
- Key dramatic moments
- Cinematic potential
- Emotional beats

### Game Format
- Player interaction opportunities
- Abilities or special traits
- Quest/mission potential
- Gameplay mechanics suggestions

### Using Media Export

1. Navigate to an entity's detail page
2. Click one of the export buttons (Novel, Video, or Game)
3. View the AI-generated pitch tailored for that medium
4. Use these summaries for adaptation planning or pitch documents

**Note:** AI-powered export requires an OpenAI API key. Without it, template-based summaries are used.

## API Reference

### Entities

- `GET /api/entities` - List all entities (supports `?type=CHARACTER` filter)
- `GET /api/entities/:id` - Get entity with relations
- `POST /api/entities` - Create entity
- `PUT /api/entities/:id` - Update entity
- `DELETE /api/entities/:id` - Delete entity

### Events

- `GET /api/events` - List all events (supports `?locationId=xyz` filter)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Relations

- `GET /api/relations` - List all relations (supports `?entityId=xyz` filter)
- `GET /api/relations/:id` - Get relation details
- `POST /api/relations` - Create relation
- `PUT /api/relations/:id` - Update relation
- `DELETE /api/relations/:id` - Delete relation

### Export

- `POST /api/export` - Generate media-specific summary
  ```json
  {
    "entityId": "entity-id",
    "targetMedia": "novel" | "video" | "game"
  }
  ```

## Sample Storyworld

The included seed data demonstrates a fantasy setting with:

- **4 Characters**: Archivist, warrior, prophet, diplomat
- **2 Locations**: Obsidian Citadel, Ruins of Velanthar
- **1 Artifact**: The Codex of Forgotten Names
- **1 Faction**: The Seekers of Lost Light
- **6 Events**: Spanning from ancient cataclysm to recent prophecies
- **9 Relationships**: Connecting all elements into a cohesive narrative

This vertical slice shows how to:
- Build interconnected character networks
- Link events to locations
- Create artifact-centered plots
- Establish faction motivations
- Use metaJson for flexible world-building

## Best Practices

### Naming Conventions
- Use descriptive, memorable entity names
- Keep relation types lowercase and snake_case
- Be consistent with date formats in your timeline

### Markdown Usage
- Use headers, lists, and emphasis in summaries
- Keep paragraphs focused and scannable
- Include sensory details for locations

### Metadata Strategy
- Use metaJson for domain-specific attributes
- Keep metadata consistent within entity types
- Document your metadata schema somewhere

### Relationship Design
- Make relation types bidirectional when it makes sense
- Use description field to add context and nuance
- Avoid redundant relationships (one direction is often enough)

### Timeline Management
- Establish a consistent calendar/era system
- Space events to allow room for expansion
- Use event metadata to categorize and filter

## Extending the System

### Adding New Entity Types

Edit `prisma/schema.prisma`:
```prisma
enum EntityType {
  CHARACTER
  LOCATION
  ARTIFACT
  FACTION
  SPECIES      // New type
  TECHNOLOGY   // New type
  OTHER
}
```

Then run:
```bash
npm run db:push
npx prisma generate
```

### Custom Metadata Fields

Use the `metaJson` field to store arbitrary data:

```typescript
// Character example
metaJson: {
  age: 287,
  species: "half-elf",
  abilities: ["magic", "swordsmanship"],
  affiliations: ["guild-id-1", "guild-id-2"]
}

// Location example
metaJson: {
  climate: "temperate",
  population: 50000,
  governance: "council",
  resources: ["mining", "agriculture"]
}
```

### Adding Custom Views

Create new pages in `app/` directory:
- Network graph visualization
- Character relationship maps
- Location-based event filtering
- Faction influence charts

## Database Commands

```bash
# Push schema changes to database
npm run db:push

# Seed the database
npm run db:seed

# Reset database and reseed
npm run db:reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

## Deployment

### Database
1. Provision a PostgreSQL database (Vercel Postgres, Supabase, etc.)
2. Update `DATABASE_URL` in production environment

### Application
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Set environment variables in deployment platform

### Environment Variables
- `DATABASE_URL` - Production PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key (optional)

## Contributing

When adding new features:
1. Update the Prisma schema if needed
2. Create/update API routes
3. Build corresponding UI components
4. Update this README with new functionality
5. Add examples to the seed data if relevant

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Built with** TypeScript, Next.js, Prisma, and a passion for great storytelling.
