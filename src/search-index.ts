import { UpstashError } from "./client/error";
import { constructFilterString, type TreeNode } from "./client/metadata";
import type { HttpClient } from "./client/search-client";
import type { Dict, VectorIndex, UpsertParameters, SearchResult, Document } from "./types";

// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTER = /[\u0000-\u001F\u007F]/;

/**
 * Returns why a value can't be used as an index name, or undefined if it can.
 *
 * `/`, `\`, `%` and control characters are not allowed in index names, and `.` and `..`
 * can't be represented as a path segment.
 */
const indexNameError = (indexName: unknown): string | undefined => {
  if (typeof indexName !== "string") {
    return "Index name must be a string.";
  }
  if (indexName === "." || indexName === "..") {
    return 'Index name cannot be "." or "..".';
  }
  if (CONTROL_CHARACTER.test(indexName)) {
    return "Index name cannot contain control characters such as tab or new line.";
  }
  if (/[/\\]/.test(indexName)) {
    return String.raw`Index name cannot contain "/" or "\".`;
  }
  if (indexName.includes("%")) {
    return 'Index name cannot contain "%". Pass the index name as it is, without percent-encoding it.';
  }
  return undefined;
};

/**
 * Represents a search index for managing and querying documents.
 *
 * Each SearchIndex instance operates within a specific index, allowing for
 * isolated document storage and retrieval. It provides methods to upsert, search,
 * fetch, delete, and manage documents within the index.
 *
 * @template TContent - Content shape associated with each document.
 * @template TIndexMetadata - Metadata shape associated with each document.
 * @see node_modules/@upstash/search/docs/getting-started.mdx
 */
export class SearchIndex<TContent = Dict, TIndexMetadata = Dict> {
  /**
   * Initializes a new SearchIndex instance for the specified index.
   *
   * @param vectorIndex - The underlying vector index used for search operations.
   * @param indexName - The name to use for this index. Must be a non-empty string. It can't
   *   contain `/`, `\`, `%` or control characters, and can't be `.` or `..`.
   * @throws Will throw an error if the index name is not provided or can't be used.
   */
  constructor(
    private httpClient: HttpClient,
    private vectorIndex: VectorIndex,
    private indexName: string
  ) {
    if (!indexName) {
      throw new Error("indexName is required when defining a SearchIndex");
    }

    const name: unknown = indexName;
    if (typeof name === "number" || typeof name === "bigint") {
      this.indexName = String(name);
    }

    const error = indexNameError(this.indexName);
    if (error !== undefined) {
      throw new UpstashError(error);
    }
  }

  /**
   * Builds the request path of an endpoint for this index. The index name is percent-encoded so
   * that characters such as `?`, `#` and spaces stay part of the name.
   */
  private pathOf = (endpoint: string): string[] => [endpoint, encodeURIComponent(this.indexName)];

  /**
   * Inserts or updates documents in the index.
   *
   * Documents are identified by their unique IDs. If a document with the same ID exists, it will be updated.
   *
   * @param params - A document or array of documents to upsert, including `id`, `content`, and optional `metadata`.
   * @returns A promise resolving to the result of the upsert operation.
   * @see node_modules/@upstash/search/docs/commands/upsert.mdx
   */
  upsert = async (
    params:
      | UpsertParameters<TContent, TIndexMetadata>
      | UpsertParameters<TContent, TIndexMetadata>[]
  ) => {
    const upsertParams = Array.isArray(params) ? params : [params];

    const path = this.pathOf("upsert-data");
    const { result } = (await this.httpClient.request({
      path,
      body: upsertParams,
    })) as { result: string; error: Error | undefined };

    return result;
  };

  /**
   * Searches for documents matching a query string.
   *
   * Returns documents that best match the provided query, optionally filtered and limited in number.
   *
   * @param query - Text string used to find matching documents within the index.
   * @param limit - Maximum number of results to retrieve (defaults to 5 documents).
   * @param filter - Optional search constraint using either a string expression or structured filter object.
   * @param reranking - Optional boolean to use enhanced search result reranking. It will have additional
   *   cost when enabled. See [Search Pricing](https://upstash.com/pricing/search) for more details
   *   (False by default)
   * @param semanticWeight - Optional relevance balance between semantic and keyword search (0-1 range, defaults to 0.75).
   *   For instance, 0.2 applies 20% semantic matching with 80% full-text matching.
   *   You can learn more about how Upstash Search works from [our docs](https://upstash.com/docs/search/features/algorithm).
   * @param inputEnrichment - Optional boolean to enhance queries before searching (enabled by default).
   * @param keepOriginalQueryAfterEnrichment - Optional boolean to keep the original query alongside the enriched one (false by default).
   * @returns Promise that resolves to an array of documents matching the
   * @see node_modules/@upstash/search/docs/commands/search.mdx
   */
  search = async (params: {
    query: string;
    limit?: number;
    filter?: string | TreeNode<TContent, TIndexMetadata>;
    reranking?: boolean;
    semanticWeight?: number;
    inputEnrichment?: boolean;
    keepOriginalQueryAfterEnrichment?: boolean;
  }): Promise<SearchResult<TContent, TIndexMetadata>> => {
    const {
      query,
      limit = 5,
      filter,
      reranking,
      semanticWeight,
      inputEnrichment,
      keepOriginalQueryAfterEnrichment,
    } = params;

    if (semanticWeight && (semanticWeight < 0 || semanticWeight > 1)) {
      throw new UpstashError("semanticWeight must be between 0 and 1");
    }

    const path = this.pathOf("search");
    const { result } = (await this.httpClient.request({
      path,
      body: {
        query,
        topK: limit,
        includeData: true,
        includeMetadata: true,
        filter:
          typeof filter === "string" || filter === undefined
            ? filter
            : constructFilterString(filter),
        reranking,
        semanticWeight,
        inputEnrichment,
        _appendOriginalInputToEnrichmentResult: keepOriginalQueryAfterEnrichment,
      },
    })) as { result: SearchResult<TContent, TIndexMetadata> };

    return result.map(({ id, content, metadata, score }) => ({
      id,
      content,
      metadata,
      score,
    }));
  };

  /**
   * Fetches documents by their IDs from the index.
   *
   * @param params - An array of document IDs to retrieve.
   * @returns A promise resolving to an array of documents or `null` if a document is not found.
   * @see node_modules/@upstash/search/docs/commands/fetch.mdx
   */
  fetch = async (params: Parameters<VectorIndex["fetch"]>[0]) => {
    const result = await this.vectorIndex.fetch(params, {
      namespace: this.indexName,
      includeData: true,
      includeMetadata: true,
    });

    return result.map((fetchResult) => {
      if (!fetchResult) return fetchResult;

      return {
        id: fetchResult.id,
        content: (fetchResult as unknown as { content: TContent }).content,
        metadata: fetchResult.metadata as TIndexMetadata,
      };
    });
  };

  /**
   * Deletes documents by their IDs from the index.
   *
   * @param params - An array of document IDs to delete.
   * @returns A promise resolving to the result of the deletion operation.
   * @see node_modules/@upstash/search/docs/commands/delete.mdx
   */
  delete = async (params: Parameters<VectorIndex["delete"]>[0]) => {
    return await this.vectorIndex.delete(params, { namespace: this.indexName });
  };

  /**
   * Retrieves documents within a specific range, with pagination support.
   *
   * Useful for paginating through large result sets by providing a `cursor`.
   *
   * @param params - Range parameters including `cursor`, `limit`, and ID `prefix`.
   * @returns A promise resolving to the next cursor and documents in the range.
   * @see node_modules/@upstash/search/docs/commands/range.mdx
   */
  range = async (params: { cursor: string; limit: number; prefix?: string }) => {
    const { nextCursor, vectors } = await this.vectorIndex.range(
      { ...params, includeData: true, includeMetadata: true },
      { namespace: this.indexName }
    );

    return {
      nextCursor,
      documents: (vectors as unknown as Document<TContent, TIndexMetadata>[]).map(
        ({ id, content, metadata }) => ({
          id,
          content,
          metadata,
        })
      ),
    };
  };

  /**
   * Clears all documents in the current index.
   *
   * Useful for resetting the index before or after tests, or when a clean state is needed.
   *
   * @returns A promise resolving to the result of the reset operation.
   * @see node_modules/@upstash/search/docs/commands/reset.mdx
   */
  reset = async () => {
    return await this.vectorIndex.reset({ namespace: this.indexName });
  };

  /**
   * Deletes the entire index and all its documents.
   *
   * Use with caution, as this operation is irreversible.
   *
   * @returns A promise resolving to the result of the delete operation.
   */
  deleteIndex = async () => {
    return await this.vectorIndex.deleteNamespace(this.indexName);
  };

  /**
   * Retrieves information about the current index.
   *
   * Provides document count and pending document count, indicating documents that are awaiting indexing.
   *
   * @returns A promise resolving to index information with document counts.
   * @see node_modules/@upstash/search/docs/commands/info.mdx
   */
  info = async () => {
    const info = await this.vectorIndex.info();
    const { pendingVectorCount, vectorCount } = info.namespaces[this.indexName] ?? {
      pendingVectorCount: 0,
      vectorCount: 0,
    };

    return {
      pendingDocumentCount: pendingVectorCount,
      documentCount: vectorCount,
    };
  };
}
