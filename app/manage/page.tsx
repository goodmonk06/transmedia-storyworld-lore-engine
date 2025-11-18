'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Entity = {
  id: string;
  type: string;
  name: string;
  summaryMarkdown: string;
  metaJson?: any;
};

type Event = {
  id: string;
  title: string;
  descriptionMarkdown: string;
  occurredAt: string;
  locationId?: string | null;
  location?: {
    name: string;
  };
};

type Relation = {
  id: string;
  relationType: string;
  description: string;
  from: { id: string; name: string };
  to: { id: string; name: string };
};

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<'entities' | 'events' | 'relations'>('entities');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showRelationForm, setShowRelationForm] = useState(false);

  useEffect(() => {
    fetchEntities();
    fetchEvents();
    fetchRelations();
  }, []);

  const fetchEntities = async () => {
    const res = await fetch('/api/entities');
    const data = await res.json();
    setEntities(data);
  };

  const fetchEvents = async () => {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(data);
  };

  const fetchRelations = async () => {
    const res = await fetch('/api/relations');
    const data = await res.json();
    setRelations(data);
  };

  const handleCreateEntity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      type: formData.get('type'),
      name: formData.get('name'),
      summaryMarkdown: formData.get('summaryMarkdown'),
      metaJson: {},
    };

    const res = await fetch('/api/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      fetchEntities();
      setShowEntityForm(false);
      e.currentTarget.reset();
    }
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get('title'),
      descriptionMarkdown: formData.get('descriptionMarkdown'),
      occurredAt: new Date(formData.get('occurredAt') as string).toISOString(),
      locationId: formData.get('locationId') || null,
      metaJson: {},
    };

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      fetchEvents();
      setShowEventForm(false);
      e.currentTarget.reset();
    }
  };

  const handleCreateRelation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      fromId: formData.get('fromId'),
      toId: formData.get('toId'),
      relationType: formData.get('relationType'),
      description: formData.get('description'),
    };

    const res = await fetch('/api/relations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      fetchRelations();
      setShowRelationForm(false);
      e.currentTarget.reset();
    }
  };

  const handleDeleteEntity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;
    const res = await fetch(`/api/entities/${id}`, { method: 'DELETE' });
    if (res.ok) fetchEntities();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (res.ok) fetchEvents();
  };

  const handleDeleteRelation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this relation?')) return;
    const res = await fetch(`/api/relations/${id}`, { method: 'DELETE' });
    if (res.ok) fetchRelations();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">
          Manage Storyworld
        </h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('entities')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'entities'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
            }`}
          >
            Entities ({entities.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'relations'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
            }`}
          >
            Relations ({relations.length})
          </button>
        </div>

        {/* Entities Tab */}
        {activeTab === 'entities' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowEntityForm(!showEntityForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showEntityForm ? 'Cancel' : 'Create Entity'}
              </button>
            </div>

            {showEntityForm && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6 shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                  New Entity
                </h2>
                <form onSubmit={handleCreateEntity} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Type
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    >
                      <option value="CHARACTER">Character</option>
                      <option value="LOCATION">Location</option>
                      <option value="ARTIFACT">Artifact</option>
                      <option value="FACTION">Faction</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Summary (Markdown)
                    </label>
                    <textarea
                      name="summaryMarkdown"
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        {entity.name}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        {entity.type}
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {entity.summaryMarkdown}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/entities/${entity.id}`}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteEntity(entity.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showEventForm ? 'Cancel' : 'Create Event'}
              </button>
            </div>

            {showEventForm && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6 shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                  New Event
                </h2>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Description (Markdown)
                    </label>
                    <textarea
                      name="descriptionMarkdown"
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Occurred At
                    </label>
                    <input
                      type="datetime-local"
                      name="occurredAt"
                      required
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Location (Optional)
                    </label>
                    <select
                      name="locationId"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    >
                      <option value="">None</option>
                      {entities
                        .filter((e) => e.type === 'LOCATION')
                        .map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        {event.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        {new Date(event.occurredAt).toLocaleString()}
                        {event.location && ` at ${event.location.name}`}
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {event.descriptionMarkdown}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relations Tab */}
        {activeTab === 'relations' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowRelationForm(!showRelationForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showRelationForm ? 'Cancel' : 'Create Relation'}
              </button>
            </div>

            {showRelationForm && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6 shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                  New Relation
                </h2>
                <form onSubmit={handleCreateRelation} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      From Entity
                    </label>
                    <select
                      name="fromId"
                      required
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    >
                      <option value="">Select entity</option>
                      {entities.map((entity) => (
                        <option key={entity.id} value={entity.id}>
                          {entity.name} ({entity.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Relation Type
                    </label>
                    <input
                      type="text"
                      name="relationType"
                      required
                      placeholder="e.g., mentor, enemy, owns, located_in"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      To Entity
                    </label>
                    <select
                      name="toId"
                      required
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    >
                      <option value="">Select entity</option>
                      {entities.map((entity) => (
                        <option key={entity.id} value={entity.id}>
                          {entity.name} ({entity.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Description
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {relations.map((relation) => (
                <div
                  key={relation.id}
                  className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {relation.from.name}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400">→</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {relation.relationType}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400">→</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {relation.to.name}
                        </span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        {relation.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteRelation(relation.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
