# Domain Notes: Storyworld Modeling

## Core Concepts

The Transmedia Storyworld Lore Engine is built around three fundamental concepts:

1. **Entities**: The "things" in your storyworld (who, where, what)
2. **Events**: The "happenings" (when, what occurred)
3. **Relations**: The "connections" (how things relate)

Together, these create a **knowledge graph** of your fictional universe.

## Domain Model Deep Dive

### LoreEntity

Entities represent the building blocks of your storyworld.

**Entity Types:**

| Type | Purpose | Examples |
|------|---------|----------|
| **CHARACTER** | People, creatures, beings | Heroes, villains, mentors, sidekicks |
| **LOCATION** | Places, regions, structures | Cities, planets, buildings, realms |
| **ARTIFACT** | Objects, items, technology | Weapons, relics, devices, books |
| **FACTION** | Groups, organizations | Guilds, kingdoms, corporations, cults |
| **OTHER** | Concepts, phenomena | Magic systems, diseases, phenomena |

**Status Workflow:**

```
DRAFT → PUBLISHED → ARCHIVED
  ↑_________|         |
           restore    |
                    ↓
```

- **DRAFT**: Work in progress, not visible in main views
- **PUBLISHED**: Canonical, visible to all
- **ARCHIVED**: Historical, kept for reference

**Visibility Levels:**

- **PUBLIC**: Visible to everyone (for community storyworlds)
- **PRIVATE**: Only visible to creator
- **TEAM**: Visible to team members (future: requires auth)

**Metadata Patterns:**

Entities use flexible `metaJson` for domain-specific attributes:

```json
// Character metadata
{
  "age": 287,
  "species": "half-elf",
  "occupation": "archivist",
  "abilities": ["photographic_memory", "ancient_languages"],
  "affiliations": ["guild-id-123"]
}

// Location metadata
{
  "climate": "temperate",
  "population": 50000,
  "governance": {
    "type": "monarchy",
    "ruler": "King Arthur"
  },
  "resources": ["mining", "agriculture"]
}

// Artifact metadata
{
  "power_level": "legendary",
  "origin": "pre-Cataclysm",
  "abilities": ["time_manipulation", "reality_bending"],
  "cursed": true,
  "curse_effects": ["corruption", "madness"]
}
```

### LoreEvent

Events represent moments in time within your storyworld.

**Temporal Ordering:**

Events are sorted by `occurredAt` (DateTime). This allows:
- Chronological timeline views
- Historical queries ("what happened before X?")
- Era-based filtering

**Event-Location Binding:**

Events can optionally reference a `locationId`, creating spatial context:
```
"The Battle of Helm's Deep" → occurred_at → "Helm's Deep (LOCATION)"
```

**Event-Timeline Association:**

Events can belong to different timelines (Phase 3 feature):
```
Timeline: "Main Canon"
  ├── Event A (Year 1000)
  ├── Event B (Year 1050)
  └── Event C (Year 1100)

Timeline: "Alternate Universe: What if Event A failed?"
  ├── Event A' (Year 1000, different outcome)
  ├── Event D (Year 1010, only exists in this timeline)
  └── Event E (Year 1020, divergence consequences)
```

**Event Participants:**

The `EventParticipant` junction table tracks **who was involved** in each event:

```
Event: "The Battle of Five Armies"
  Participants:
    - Thorin Oakenshield (role: "leader", notes: "Led dwarf forces")
    - Gandalf (role: "participant", notes: "Provided strategic guidance")
    - Azog (role: "antagonist", notes: "Led orc army")
    - Beorn (role: "ally", notes: "Arrived late, turned the tide")
```

This enables queries like:
- "What events was CHARACTER X involved in?"
- "Who witnessed EVENT Y?"
- "Find all battles CHARACTER Z participated in"

### LoreRelation

Relations define how entities connect to each other.

**Directional Nature:**

Relations are **directed**: A → relates_to → B

```
Gandalf → mentors → Frodo
Frodo → student_of → Gandalf  (reverse relation, if needed)
```

**Relation Strength:**

The `strength` field (1-10) indicates intensity:
- 1-3: Weak connection (acquaintances, distant relatives)
- 4-6: Moderate connection (friends, colleagues)
- 7-9: Strong connection (close friends, family)
- 10: Unbreakable bond (soul mates, sworn brothers)

**Temporal Relations:**

Relations can have start/end dates:

```
Relation: Aragorn → ruled → Gondor
  Started: Year 3019 (coronation)
  Ended: Year 3120 (death)
```

This enables queries like:
- "Who ruled Gondor in Year 3050?"
- "What relationships ended during the War?"

**Conflict Relations:**

The `isConflict` flag marks antagonistic relationships:

```
Luke Skywalker → enemy → Darth Vader (isConflict: true)
Batman → nemesis → Joker (isConflict: true)
```

**Common Relation Types:**

| Category | Relation Types |
|----------|---------------|
| Family | parent, child, sibling, spouse, ancestor |
| Social | friend, ally, rival, enemy, mentor, student |
| Professional | employer, employee, colleague, partner |
| Power | ruler, subject, master, servant |
| Spatial | resident_of, neighbor, guard_of, owns |
| Temporal | predecessor, successor, contemporary |
| Artifact | created, wields, seeks, destroyed |

### Tag System (Phase 3)

Tags provide flexible categorization across entities and events.

**Tag Categories:**

```
Genre Tags: fantasy, sci-fi, horror, mystery, comedy
Theme Tags: redemption, revenge, coming-of-age, sacrifice
Mood Tags: dark, light-hearted, suspenseful, whimsical
Status Tags: work-in-progress, needs-review, completed
Content Tags: violence, romance, philosophical, political
```

**Multi-dimensional Tagging:**

Entities can have multiple tags from different categories:

```
Character: "Darth Vader"
  Tags:
    - Genre: sci-fi
    - Theme: redemption
    - Mood: dark
    - Role: villain-turned-hero
```

**Tag-based Queries:**

- Find all "dark fantasy" characters
- Get events tagged with "betrayal"
- Filter projects by "young-adult" target audience

### MediaProject (Phase 3)

Projects group entities and events for specific media adaptations.

**Project Workflow:**

```
1. Create project: "Star Wars: A New Hope (Novel Adaptation)"
2. Add entities: Luke, Leia, Darth Vader, R2-D2, etc.
3. Add events: "Luke meets Obi-Wan", "Death Star battle"
4. Assign roles: Luke = protagonist, Vader = antagonist
5. Sequence events: Define narrative order
6. Generate export for target media
```

**Media Types:**

- **novel**: Long-form prose
- **video**: Film, TV series
- **game**: Video game, tabletop RPG
- **comic**: Graphic novel, manga
- **audio**: Podcast, audiobook
- **transmedia**: Cross-platform experience

**Project-Entity Association:**

```
Project: "The Lord of the Rings: The Fellowship (Film)"
  Entities:
    - Frodo (role: "protagonist")
    - Gandalf (role: "mentor")
    - Sauron (role: "antagonist")
    - The One Ring (role: "macguffin")

Project: "The Lord of the Rings: The Two Towers (Film)"
  Entities:
    - Aragorn (role: "protagonist")  // elevated from supporting
    - Théoden (role: "supporting")   // new to this installment
    - Saruman (role: "antagonist")
```

### StoryArc (Phase 3)

Story arcs represent narrative progressions spanning multiple events.

**Arc Structure:**

```
Arc: "Frodo's Journey to Destroy the Ring"
  Start Date: Year 3018 (Shire)
  End Date: Year 3019 (Mount Doom)

  Events (sequenced):
    1. Frodo inherits the Ring
    2. Council of Elrond
    3. Formation of the Fellowship
    4. Frodo separates from Fellowship
    5. Frodo meets Gollum
    6. Frodo reaches Mount Doom
    7. Ring destroyed

  Entities involved:
    - Frodo (role: "protagonist")
    - Sam (role: "companion")
    - Gollum (role: "guide/betrayer")
    - The One Ring (role: "object")
```

**Arc Types:**

- **Character Arc**: Individual growth/change
- **Plot Arc**: Main storyline
- **Subplot**: Secondary narrative thread
- **Season Arc**: TV season-long narrative
- **Series Arc**: Overarching story across multiple installments

### Timeline System (Phase 3)

Support for alternate timelines and parallel universes.

**Mainline Timeline:**

The canonical, primary timeline of your storyworld.

```
Timeline: "Marvel Cinematic Universe - Main"
  isMainline: true
  Events: [Iron Man, Avengers, Endgame, ...]
```

**Branched Timelines:**

Alternative histories that diverge from main timeline:

```
Timeline: "What If... Tony Stark Never Escaped?"
  isMainline: false
  branchedFrom: "MCU Main"
  branchedAt: "2008-05-02" (Iron Man origin)
  Events: [Alternate events from this point...]
```

**Use Cases:**

- **What-if scenarios**: Explore alternative outcomes
- **Parallel universes**: Spider-Verse, multiverse stories
- **Retcons**: Keep old canon while introducing new
- **Game branches**: Player choice consequences

### EntityVersion (Phase 3)

Track how entities evolve over time.

**Version History:**

```
Entity: "Anakin Skywalker / Darth Vader"

  Version 1 (Episode I):
    name: "Anakin Skywalker"
    summary: "Young slave boy on Tatooine..."
    changeNote: "Initial appearance"

  Version 2 (Episode II):
    name: "Anakin Skywalker"
    summary: "Padawan learner, conflicted..."
    changeNote: "Ten years later, grown up"

  Version 3 (Episode III):
    name: "Darth Vader"
    summary: "Fallen Jedi, now Sith Lord..."
    changeNote: "Turned to the dark side"
```

**Use Cases:**

- **Character development**: Track growth over time
- **Historical accuracy**: "What did we know about X in Year Y?"
- **Retcon management**: Keep history of changes
- **Worldbuilding evolution**: Document lore refinements

## Modeling Best Practices

### 1. Entity Granularity

**Too coarse:**
```
Entity: "Skywalker Family"
  Summary: "The Skywalker family includes Anakin, Luke, Leia..."
```

**Too fine:**
```
Entity: "Luke's Left Hand"
  Summary: "Luke Skywalker's original left hand..."
```

**Just right:**
```
Entity: "Luke Skywalker"
  Summary: "Jedi Knight, son of Anakin..."
  Relations:
    - child_of → Anakin Skywalker
    - sibling → Leia Organa
```

### 2. Relation Directionality

Prefer **intentional directionality**:

```
Good:
  Obi-Wan → mentors → Anakin

Better:
  Obi-Wan → mentors → Anakin
  Anakin → student_of → Obi-Wan
```

Two relations provide richer semantics than one bidirectional.

### 3. Event Atomicity

Keep events **atomic** (single occurrence):

```
Too broad:
  Event: "The Clone Wars"
  (Spans 3 years, thousands of battles)

Better:
  Event: "Battle of Geonosis" (first battle)
  Event: "Siege of Mandalore" (final battle)
  Arc: "The Clone Wars" (contains all battles)
```

### 4. Metadata vs. Entities

When to use metadata vs. separate entities:

**Use metadata for:**
- Attributes (age, height, color)
- Simple lists (abilities, skills)
- Structured data (coordinates, stats)

**Use separate entities for:**
- Things with their own history (important artifacts)
- Things in relationships (factions, groups)
- Things with multiple references (locations)

### 5. Tag Consistency

Establish **tag naming conventions**:

```
Good:
  - fantasy-medieval
  - sci-fi-space-opera
  - theme-redemption

Avoid:
  - Fantasy (Medieval)
  - SciFi: Space Opera
  - REDEMPTION THEME
```

## Domain Patterns

### Pattern: Hero's Journey

```
Entities:
  - Hero (CHARACTER, protagonist)
  - Mentor (CHARACTER, guide)
  - Antagonist (CHARACTER, villain)
  - Special Object (ARTIFACT, macguffin)
  - Ordinary World (LOCATION, home)
  - Special World (LOCATION, adventure realm)

Events (sequenced):
  1. Call to Adventure
  2. Meeting the Mentor
  3. Crossing the Threshold
  4. Tests and Trials
  5. Ordeal (climax)
  6. Return with Treasure

Relations:
  - Mentor → guides → Hero
  - Hero → opposes → Antagonist
  - Hero → seeks → Special Object
```

### Pattern: Political Intrigue

```
Entities:
  - Multiple Factions (competing houses/nations)
  - Key Players (lords, ladies, advisors)
  - Strategic Locations (capitals, fortresses)
  - Power Artifacts (crowns, seals, documents)

Relations:
  - Faction A → allied_with → Faction B
  - Faction A → at_war_with → Faction C
  - Lord X → member_of → Faction A
  - Lord X → secretly_allied → Faction C

Events:
  - Marriages (alliance formation)
  - Assassinations (power shifts)
  - Betrayals (relation changes)
  - Battles (territorial control)
```

### Pattern: Mystery Investigation

```
Entities:
  - Detective (CHARACTER, protagonist)
  - Suspects (CHARACTERs, potential culprits)
  - Victim (CHARACTER, deceased/harmed)
  - Crime Scene (LOCATION, where it happened)
  - Clues (ARTIFACTs, evidence)

Events:
  - Crime Occurs (initial event)
  - Clue Discoveries (investigation progress)
  - Suspect Interviews (information gathering)
  - Revelation (solution)

Tags:
  - suspect (on characters)
  - evidence (on artifacts)
  - red-herring (on false leads)
```

## Advanced Concepts

### Emergent Narrative

As your storyworld grows, **patterns emerge** from the data:

- Who are the most connected characters? (relationship hubs)
- What locations see the most activity? (event frequency)
- Which time periods have the most events? (narrative density)
- What are the longest relationship chains? (degrees of separation)

**Query examples:**
```sql
-- Most connected character
SELECT entityId, COUNT(*) as connection_count
FROM (
  SELECT fromId as entityId FROM LoreRelation
  UNION ALL
  SELECT toId as entityId FROM LoreRelation
) connections
GROUP BY entityId
ORDER BY connection_count DESC
LIMIT 1;

-- Most active location
SELECT locationId, COUNT(*) as event_count
FROM LoreEvent
WHERE locationId IS NOT NULL
GROUP BY locationId
ORDER BY event_count DESC;
```

### Consistency Checking

The system enables **automated consistency checks**:

1. **Timeline consistency**: No character dies then reappears
2. **Spatial consistency**: Character can't be in two places at once
3. **Relationship consistency**: No circular parentage
4. **Event consistency**: Participants must exist at event time

### Narrative Generation

With rich interconnected data, you can **generate narratives**:

```
Input: Character A, Character B
Algorithm:
  1. Find shortest path of relations between A and B
  2. Find events both participated in
  3. Order events chronologically
  4. Generate narrative prose

Output: "Character A first met Character B when..."
```

---

**Last Updated:** 2025-11-18
**Version:** 1.0.0
