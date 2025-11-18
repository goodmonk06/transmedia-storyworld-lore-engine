#!/usr/bin/env tsx
/**
 * CLI tool for the Lore Engine
 * Provides command-line utilities for common operations
 */

import { PrismaClient } from '@prisma/client';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const program = new Command();

program
  .name('lore-cli')
  .description('CLI tool for the Transmedia Storyworld Lore Engine')
  .version('1.0.0');

// Entity create command
program
  .command('entity:create')
  .description('Create a new entity')
  .requiredOption('-t, --type <type>', 'Entity type (CHARACTER, LOCATION, ARTIFACT, FACTION, OTHER)')
  .requiredOption('-n, --name <name>', 'Entity name')
  .requiredOption('-s, --summary <summary>', 'Entity summary')
  .option('--status <status>', 'Status (DRAFT, PUBLISHED, ARCHIVED)', 'DRAFT')
  .action(async (options) => {
    try {
      const entity = await prisma.loreEntity.create({
        data: {
          type: options.type,
          name: options.name,
          summaryMarkdown: options.summary,
          status: options.status,
        },
      });
      console.log('✓ Entity created:', entity.id);
      console.log(JSON.stringify(entity, null, 2));
    } catch (error) {
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

// Project create command
program
  .command('project:create')
  .description('Create a new media project')
  .requiredOption('-n, --name <name>', 'Project name')
  .requiredOption('-s, --slug <slug>', 'Project slug')
  .requiredOption('-m, --mediaType <type>', 'Media type (novel, video, game, etc.)')
  .option('-d, --description <desc>', 'Project description')
  .action(async (options) => {
    try {
      const project = await prisma.mediaProject.create({
        data: {
          name: options.name,
          slug: options.slug,
          mediaType: options.mediaType,
          description: options.description,
        },
      });
      console.log('✓ Project created:', project.id);
      console.log(JSON.stringify(project, null, 2));
    } catch (error) {
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

// Import command
program
  .command('import:json')
  .description('Import entities from a JSON file')
  .requiredOption('-f, --file <path>', 'Path to JSON file')
  .action(async (options) => {
    try {
      const filePath = path.resolve(options.file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      let created = 0;
      if (Array.isArray(data.entities)) {
        for (const entity of data.entities) {
          await prisma.loreEntity.create({ data: entity });
          created++;
        }
      }

      console.log(`✓ Imported ${created} entities`);
    } catch (error) {
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

// Export command
program
  .command('export:markdown')
  .description('Export all entities as markdown files')
  .requiredOption('-o, --output <dir>', 'Output directory')
  .action(async (options) => {
    try {
      const outputDir = path.resolve(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const entities = await prisma.loreEntity.findMany({
        include: {
          relationsFrom: {
            include: { to: true },
          },
          relationsTo: {
            include: { from: true },
          },
        },
      });

      for (const entity of entities) {
        const filename = `${entity.type.toLowerCase()}-${entity.id}.md`;
        const filepath = path.join(outputDir, filename);

        let markdown = `# ${entity.name}\n\n`;
        markdown += `**Type:** ${entity.type}\n\n`;
        markdown += `**Status:** ${entity.status}\n\n`;
        markdown += `## Summary\n\n${entity.summaryMarkdown}\n\n`;

        if (entity.relationsFrom.length > 0) {
          markdown += `## Relationships\n\n`;
          for (const rel of entity.relationsFrom) {
            markdown += `- **${rel.relationType}** → ${rel.to.name}\n`;
          }
          markdown += '\n';
        }

        fs.writeFileSync(filepath, markdown);
      }

      console.log(`✓ Exported ${entities.length} entities to ${outputDir}`);
    } catch (error) {
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Generate statistics about the storyworld')
  .action(async () => {
    try {
      const [entities, events, relations, projects, tags] = await Promise.all([
        prisma.loreEntity.count(),
        prisma.loreEvent.count(),
        prisma.loreRelation.count(),
        prisma.mediaProject.count(),
        prisma.tag.count(),
      ]);

      const entityTypes = await prisma.loreEntity.groupBy({
        by: ['type'],
        _count: true,
      });

      console.log('\n=== Storyworld Statistics ===\n');
      console.log(`Total Entities: ${entities}`);
      console.log(`Total Events: ${events}`);
      console.log(`Total Relations: ${relations}`);
      console.log(`Total Projects: ${projects}`);
      console.log(`Total Tags: ${tags}`);
      console.log('\nEntities by Type:');
      for (const type of entityTypes) {
        console.log(`  ${type.type}: ${type._count}`);
      }
      console.log('');
    } catch (error) {
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

program.parse();
