'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

type Entity = {
  id: string;
  type: string;
  name: string;
  summaryMarkdown: string;
  metaJson: any;
  eventsAtLocation: Array<{
    id: string;
    title: string;
    occurredAt: string;
  }>;
  relationsFrom: Array<{
    id: string;
    relationType: string;
    description: string;
    to: {
      id: string;
      name: string;
      type: string;
    };
  }>;
  relationsTo: Array<{
    id: string;
    relationType: string;
    description: string;
    from: {
      id: string;
      name: string;
      type: string;
    };
  }>;
};

type ExportData = {
  summary: string;
  targetMedia: string;
};

export default function EntityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);

  useEffect(() => {
    fetch(`/api/entities/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEntity(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching entity:', error);
        setLoading(false);
      });
  }, [id]);

  const handleExport = async (targetMedia: string) => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityId: id, targetMedia }),
      });
      const data = await response.json();
      setExportData({ summary: data.summary, targetMedia });
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Entity not found</p>
      </div>
    );
  }

  const entityTypeColors: Record<string, string> = {
    CHARACTER: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
    LOCATION: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    ARTIFACT: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100',
    FACTION: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
    OTHER: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100',
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/entities" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Entities
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-lg border border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  {entity.name}
                </h1>
                <span
                  className={`inline-block text-sm px-3 py-1 rounded-full ${
                    entityTypeColors[entity.type]
                  }`}
                >
                  {entity.type}
                </span>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <ReactMarkdown>{entity.summaryMarkdown}</ReactMarkdown>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                Media Export
              </h2>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleExport('novel')}
                  disabled={exportLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Novel Pitch
                </button>
                <button
                  onClick={() => handleExport('video')}
                  disabled={exportLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Video Pitch
                </button>
                <button
                  onClick={() => handleExport('game')}
                  disabled={exportLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Game Pitch
                </button>
              </div>

              {exportData && (
                <div className="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                    {exportData.targetMedia.toUpperCase()} Export:
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{exportData.summary}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          {entity.type === 'LOCATION' && entity.eventsAtLocation.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-lg border border-zinc-200 dark:border-zinc-700 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                Events at this Location
              </h2>
              <div className="space-y-3">
                {entity.eventsAtLocation.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
                  >
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {event.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(event.occurredAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(entity.relationsFrom.length > 0 || entity.relationsTo.length > 0) && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-lg border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                Relationships
              </h2>
              <div className="space-y-4">
                {entity.relationsFrom.map((relation) => (
                  <div
                    key={relation.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {entity.name}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">→</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {relation.relationType}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">→</span>
                      <Link
                        href={`/entities/${relation.to.id}`}
                        className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline"
                      >
                        {relation.to.name}
                      </Link>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {relation.description}
                    </p>
                  </div>
                ))}
                {entity.relationsTo.map((relation) => (
                  <div
                    key={relation.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/entities/${relation.from.id}`}
                        className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline"
                      >
                        {relation.from.name}
                      </Link>
                      <span className="text-zinc-600 dark:text-zinc-400">→</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {relation.relationType}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">→</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {entity.name}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {relation.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
