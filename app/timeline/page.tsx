import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  const events = await prisma.loreEvent.findMany({
    orderBy: { occurredAt: 'asc' },
    include: {
      location: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">
          Timeline
        </h1>

        {events.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No events in the timeline yet.
            </p>
            <Link
              href="/manage"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                      {event.title}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {new Date(event.occurredAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {event.location && (
                    <Link
                      href={`/entities/${event.location.id}`}
                      className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {event.location.name}
                    </Link>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{event.descriptionMarkdown}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
