import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
              Transmedia Storyworld Lore Engine
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Build, explore, and export your storyworld across different media formats
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link href="/timeline">
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-zinc-200 dark:border-zinc-700">
                <h2 className="text-2xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
                  Timeline
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Explore events chronologically, see how your storyworld unfolds over time
                </p>
              </div>
            </Link>

            <Link href="/entities">
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-zinc-200 dark:border-zinc-700">
                <h2 className="text-2xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
                  Entities
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Browse characters, locations, artifacts, and factions in your world
                </p>
              </div>
            </Link>

            <Link href="/manage">
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-zinc-200 dark:border-zinc-700">
                <h2 className="text-2xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
                  Manage
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Create and edit entities, events, and relationships
                </p>
              </div>
            </Link>

            <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-2xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
                Media Export
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Generate tailored summaries for novels, video, or games
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Getting Started
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              This lore engine helps you build coherent storyworlds that can be adapted across different media.
              Start by exploring the sample data, or jump into Manage to create your own entities and events.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
