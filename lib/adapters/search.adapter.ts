/**
 * Search Adapter Interface
 * Allows plugging in different search engines (Elasticsearch, MeiliSearch, etc.)
 */

export interface SearchDocument {
  id: string;
  type: 'entity' | 'event' | 'relation';
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface SearchQuery {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface ISearchAdapter {
  index(document: SearchDocument): Promise<void>;
  indexBatch(documents: SearchDocument[]): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult[]>;
  delete(id: string): Promise<void>;
  clearIndex(): Promise<void>;
}

/**
 * In-memory search implementation (simple, for development)
 */
export class InMemorySearchAdapter implements ISearchAdapter {
  private documents: Map<string, SearchDocument> = new Map();

  async index(document: SearchDocument): Promise<void> {
    this.documents.set(document.id, document);
  }

  async indexBatch(documents: SearchDocument[]): Promise<void> {
    for (const doc of documents) {
      await this.index(doc);
    }
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const queryLower = query.query.toLowerCase();
    const results: SearchResult[] = [];

    for (const [id, doc] of this.documents.entries()) {
      const titleMatch = doc.title.toLowerCase().includes(queryLower);
      const contentMatch = doc.content.toLowerCase().includes(queryLower);

      if (titleMatch || contentMatch) {
        // Simple relevance scoring
        let score = 0;
        if (titleMatch) score += 2;
        if (contentMatch) score += 1;

        // Apply filters if present
        if (query.filters) {
          const matchesFilters = Object.entries(query.filters).every(([key, value]) => {
            return doc.metadata?.[key] === value;
          });
          if (!matchesFilters) continue;
        }

        // Create snippet
        const snippet = this.createSnippet(doc.content, queryLower);

        results.push({
          id: doc.id,
          type: doc.type,
          title: doc.title,
          snippet,
          score,
          metadata: doc.metadata,
        });
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 10;
    return results.slice(offset, offset + limit);
  }

  async delete(id: string): Promise<void> {
    this.documents.delete(id);
  }

  async clearIndex(): Promise<void> {
    this.documents.clear();
  }

  private createSnippet(content: string, query: string, maxLength: number = 150): string {
    const index = content.toLowerCase().indexOf(query);
    if (index === -1) {
      return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + 100);
    let snippet = content.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }
}

// Default adapter
export const searchAdapter: ISearchAdapter = new InMemorySearchAdapter();
