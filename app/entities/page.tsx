import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const entityTypeColors = {
  CHARACTER: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
  LOCATION: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  ARTIFACT: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100',
  FACTION: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  OTHER: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100',
};

export default async function EntitiesPage() {
  const entities = await prisma.loreEntity.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          eventsAtLocation: true,
          relationsFrom: true,
          relationsTo: true,
        },
      },
    },
  });

  const groupedEntities = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) {
      acc[entity.type] = [];
    }
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, typeof entities>);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Entities
          </h1>
          <Link
            href="/manage"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Entities
          </Link>
        </div>

        {entities.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No entities created yet.
            </p>
            <Link
              href="/manage"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Entities
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEntities).map(([type, entities]) => (
              <div key={type}>
                <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                  {type}S
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entities.map((entity) => (
                    <Link key={entity.id} href={`/entities/${entity.id}`}>
                      <div className="bg-white dark:bg-zinc-800 rounded-lg p-5 shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-zinc-200 dark:border-zinc-700 h-full">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                            {entity.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              entityTypeColors[entity.type as keyof typeof entityTypeColors]
                            }`}
                          >
                            {entity.type}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 mb-3">
                          {entity.summaryMarkdown.substring(0, 150)}
                          {entity.summaryMarkdown.length > 150 ? '...' : ''}
                        </p>
                        <div className="flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>
                            {entity._count.relationsFrom + entity._count.relationsTo} relations
                          </span>
                          {entity.type === 'LOCATION' && (
                            <span>{entity._count.eventsAtLocation} events</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
