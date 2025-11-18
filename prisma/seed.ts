import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.loreRelation.deleteMany();
  await prisma.loreEvent.deleteMany();
  await prisma.loreEntity.deleteMany();

  console.log('Cleared existing data');

  // Create Locations
  const citadel = await prisma.loreEntity.create({
    data: {
      type: 'LOCATION',
      name: 'The Obsidian Citadel',
      summaryMarkdown: `An ancient fortress carved from a single mountain of black volcanic glass. The Citadel serves as the seat of power in the realm, its towering spires visible for miles across the Ashen Plains. Within its walls, the Council of Seven deliberates on matters of state and arcane research.

The architecture is a blend of military pragmatism and mystical aesthetics, with runes etched into every surface to channel and contain magical energies.`,
      metaJson: {
        climate: 'temperate',
        population: 5000,
        founded: 'First Age, Year 237',
      },
    },
  });

  const ruins = await prisma.loreEntity.create({
    data: {
      type: 'LOCATION',
      name: 'Ruins of Velanthar',
      summaryMarkdown: `The fallen capital of the old kingdom, now a haunted wasteland of crumbling towers and overgrown courtyards. Velanthar fell during the Cataclysm Wars, and its ruins are said to be cursed. Few dare venture into its depths, but those who do speak of strange whispers and visions of the past.`,
      metaJson: {
        status: 'abandoned',
        danger_level: 'high',
        notable_features: ['cursed', 'ancient_artifacts'],
      },
    },
  });

  // Create Characters
  const archivist = await prisma.loreEntity.create({
    data: {
      type: 'CHARACTER',
      name: 'Seraphine the Archivist',
      summaryMarkdown: `Chief scholar of the Obsidian Citadel's great library. Seraphine is a half-elf in her third century of life, possessing an encyclopedic knowledge of pre-Cataclysm history. She wears simple robes adorned with intricate bookbinding tools and always carries a leather journal.

Despite her vast knowledge, Seraphine is haunted by gaps in the historical record—entire decades that seem to have been deliberately erased from all surviving texts.`,
      metaJson: {
        age: 287,
        species: 'half-elf',
        occupation: 'chief_archivist',
        abilities: ['photographic_memory', 'ancient_languages', 'divination'],
      },
    },
  });

  const shadowKnight = await prisma.loreEntity.create({
    data: {
      type: 'CHARACTER',
      name: 'Kael Shadowblade',
      summaryMarkdown: `Former captain of the Citadel guard, now a wandering mercenary haunted by his past. Kael bears a cursed sword he retrieved from the Ruins of Velanthar, which whispers dark promises in his dreams. His face is marked by a distinctive scar that glows faintly in moonlight.

Once a hero, Kael now struggles with the corruption seeping from his weapon, seeking a way to break the curse before it consumes him entirely.`,
      metaJson: {
        age: 34,
        species: 'human',
        occupation: 'mercenary',
        abilities: ['master_swordsman', 'shadow_magic', 'tactical_genius'],
        afflictions: ['cursed_weapon'],
      },
    },
  });

  const prophet = await prisma.loreEntity.create({
    data: {
      type: 'CHARACTER',
      name: 'Mirael the Seer',
      summaryMarkdown: `A mysterious oracle who appeared at the Citadel gates five years ago, claiming to have visions of a coming catastrophe. Mirael speaks in riddles and cryptic warnings, but her prophecies have proven disturbingly accurate on multiple occasions.

No one knows where she comes from or what drives her. Some believe she's a survivor from Velanthar, others whisper she might be something far more ancient.`,
      metaJson: {
        age: 'unknown',
        species: 'unknown',
        occupation: 'oracle',
        abilities: ['prophecy', 'dream_walking', 'fate_weaving'],
      },
    },
  });

  const emissary = await prisma.loreEntity.create({
    data: {
      type: 'CHARACTER',
      name: 'Lord Darius Thornwell',
      summaryMarkdown: `Charismatic leader of the Council of Seven and chief diplomat of the Citadel. Darius is known for his silver tongue and political cunning. He believes in maintaining order through careful manipulation and strategic alliances.

Behind his charming facade, Darius harbors a ruthless determination to prevent another Cataclysm, even if it means making morally questionable decisions.`,
      metaJson: {
        age: 52,
        species: 'human',
        occupation: 'council_leader',
        abilities: ['diplomacy', 'political_maneuvering', 'minor_enchantment'],
      },
    },
  });

  // Create Artifact
  const tome = await prisma.loreEntity.create({
    data: {
      type: 'ARTIFACT',
      name: 'The Codex of Forgotten Names',
      summaryMarkdown: `An ancient tome bound in midnight-blue leather with silver clasps. The Codex contains the true names of entities that existed before the Cataclysm. Speaking these names aloud grants power over the named entities, but at a terrible cost.

The Codex is kept in the deepest vault of the Citadel's library, accessible only to Seraphine and the Council of Seven.`,
      metaJson: {
        power_level: 'legendary',
        danger: 'extreme',
        origin: 'pre-Cataclysm',
      },
    },
  });

  // Create Faction
  const seekers = await prisma.loreEntity.create({
    data: {
      type: 'FACTION',
      name: 'The Seekers of Lost Light',
      summaryMarkdown: `A secretive organization dedicated to recovering artifacts and knowledge from before the Cataclysm. They believe that the key to preventing future disasters lies in understanding what caused the first one.

The Seekers operate in the shadows, often at odds with the Council's official policies. They're known to fund dangerous expeditions into cursed ruins and forbidden territories.`,
      metaJson: {
        size: 'medium',
        influence: 'moderate',
        alignment: 'neutral_good',
      },
    },
  });

  console.log('Created entities');

  // Create Relations
  await prisma.loreRelation.create({
    data: {
      fromId: archivist.id,
      toId: citadel.id,
      relationType: 'resides_at',
      description:
        'Seraphine has spent over a century at the Citadel, becoming synonymous with its vast library.',
    },
  });

  await prisma.loreRelation.create({
    data: {
      fromId: archivist.id,
      toId: tome.id,
      relationType: 'guardian_of',
      description:
        'As chief archivist, Seraphine is the primary custodian of the Codex, though she fears its power.',
    },
  });

  await prisma.loreRelation.create({
    data: {
      fromId: shadowKnight.id,
      toId: ruins.id,
      relationType: 'haunted_by',
      description:
        "Kael's expedition to Velanthar changed him forever. The cursed sword he found there whispers of the city's fall.",
    },
  });

  await prisma.loreRelation.create({
    data: {
      fromId: archivist.id,
      toId: shadowKnight.id,
      relationType: 'seeks_to_help',
      description:
        "Seraphine researches ancient curse-breaking rituals, hoping to save Kael from the sword's corruption.",
    },
  });

  await prisma.loreRelation.create({
    data: {
      fromId: prophet.id,
      toId: citadel.id,
      relationType: 'advisor_at',
      description:
        "Mirael resides in the Citadel's northern tower, where she continues to receive and interpret visions.",
    },
  });

  await prisma.loreRelation.create({
    data: {
      fromId: emissary.id,
      toId: prophet.id,
      relationType: 'distrusts',
      description:
        "Darius values Mirael's prophecies but fears her influence over the other Council members.",
    },
  });

  await prisma.loreRelation.create({
    data: {
      fromId: emissary.id,
      toId: citadel.id,
      relationType: 'leads',
      description: 'Darius presides over the Council of Seven from the Citadel.',
    },
  });

  await prisma.loreRelation.create({
    data: {
      fromId: seekers.id,
      toId: ruins.id,
      relationType: 'investigates',
      description: 'The Seekers regularly mount expeditions to Velanthar, seeking lost knowledge.',
    },
  });

  await prisma.loreRelation.create({
    data: {
      fromId: shadowKnight.id,
      toId: seekers.id,
      relationType: 'member_of',
      description:
        'Kael secretly works with the Seekers, hoping they can help him break his curse.',
    },
  });

  console.log('Created relations');

  // Create Events
  await prisma.loreEvent.create({
    data: {
      title: 'The Cataclysm Wars',
      descriptionMarkdown: `The ancient conflict that reshaped the world. Kingdoms rose and fell, powerful magics were unleashed, and entire cities were erased from existence. Velanthar, once the greatest city in the realm, was destroyed in a single night.

The exact cause of the Cataclysm remains unknown, as most records were lost. What little remains suggests it involved the misuse of true names and forbidden bindings.`,
      occurredAt: new Date('1200-03-15T00:00:00Z'),
      locationId: ruins.id,
      metaJson: {
        type: 'historical_catastrophe',
        impact: 'world_changing',
      },
    },
  });

  await prisma.loreEvent.create({
    data: {
      title: 'Discovery of the Codex',
      descriptionMarkdown: `During an expedition to catalogue relics from the old kingdom, Seraphine discovered the Codex of Forgotten Names sealed in a warded vault. The moment she touched it, she experienced a vivid vision of the Cataclysm.

Since that day, Seraphine has dedicated herself to understanding the Codex while ensuring its power is never misused.`,
      occurredAt: new Date('1387-07-23T00:00:00Z'),
      locationId: citadel.id,
      metaJson: {
        type: 'discovery',
        significance: 'critical',
      },
    },
  });

  await prisma.loreEvent.create({
    data: {
      title: 'Kael\'s Fateful Expedition',
      descriptionMarkdown: `Captain Kael Shadowblade led a military expedition into the Ruins of Velanthar to investigate reports of strange lights. His entire squad was lost in the ruins. Only Kael emerged, bearing the cursed blade and bearing no memory of what happened to his men.

The Council stripped him of his rank when the sword's corruption became apparent. Kael left the Citadel in disgrace shortly after.`,
      occurredAt: new Date('1493-11-08T00:00:00Z'),
      locationId: ruins.id,
      metaJson: {
        type: 'tragedy',
        casualties: 12,
      },
    },
  });

  await prisma.loreEvent.create({
    data: {
      title: 'Arrival of the Seer',
      descriptionMarkdown: `A hooded figure appeared at the Citadel gates during a violent storm, claiming to bear urgent prophecy. When the guards tried to turn her away, lightning struck the ground at her feet, and she spoke her first prophecy:

"Before five winters pass, shadows from the old world shall wake. The Codex knows their names. The blade remembers their binding. The archivist holds the key, but the Council's fear may doom you all."

Lord Darius granted her sanctuary, and she has remained ever since.`,
      occurredAt: new Date('1498-02-14T00:00:00Z'),
      locationId: citadel.id,
      metaJson: {
        type: 'arrival',
        prophecy: true,
      },
    },
  });

  await prisma.loreEvent.create({
    data: {
      title: 'The Pact of Seekers',
      descriptionMarkdown: `After years of covert operations, the Seekers of Lost Light formally approached the Council requesting official support for their expeditions. Lord Darius negotiated a compromise: the Seekers would be allowed limited access to restricted archives in exchange for sharing any discoveries.

Seraphine privately objected, fearing this would lead to more incidents like Kael's. Her concerns were noted but overruled.`,
      occurredAt: new Date('1501-08-30T00:00:00Z'),
      locationId: citadel.id,
      metaJson: {
        type: 'political_agreement',
        parties: ['Council of Seven', 'Seekers of Lost Light'],
      },
    },
  });

  await prisma.loreEvent.create({
    data: {
      title: 'Mirael\'s Warning',
      descriptionMarkdown: `During a routine Council session, Mirael collapsed and began speaking in an ancient dialect. Seraphine recognized it as pre-Cataclysm Velantharian. When translated, the prophecy spoke of a "shadow-bearer who must choose between damnation and salvation."

Many believe this refers to Kael and his cursed sword. The prophecy also mentions "the archivist's burden" and "the price of forgotten names," which deeply troubles both Seraphine and Darius.

Time grows short, and the Council must decide how to act on this knowledge.`,
      occurredAt: new Date('1503-01-10T00:00:00Z'),
      locationId: citadel.id,
      metaJson: {
        type: 'prophecy',
        urgency: 'critical',
        status: 'active',
      },
    },
  });

  console.log('Created events');

  console.log('Seed completed successfully!');
  console.log('\nSummary:');
  console.log('- 7 entities (4 characters, 2 locations, 1 artifact, 1 faction)');
  console.log('- 9 relations');
  console.log('- 6 events');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
