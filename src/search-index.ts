import { constructFilterString, type TreeNode } from "./client/metadata";
import type { HttpClient } from "./client/search-client";
import type { Dict, VectorIndex, UpsertParameters, SearchResult, Document } from "./types";

/**
 * Represents a search index for managing and querying documents.
 *
 * Each SearchIndex instance operates within a specific index, allowing for
 * isolated document storage and retrieval. It provides methods to upsert, search,
 * fetch, delete, and manage documents within the index.
 *
 * @template TContent - Content shape associated with each document.
 * @template TIndexMetadata - Metadata shape associated with each document.
 */
export class SearchIndex<TContent extends Dict = Dict, TIndexMetadata extends Dict = Dict> {
  /**
   * Initializes a new SearchIndex instance for the specified index.
   *
   * @param vectorIndex - The underlying vector index used for search operations.
   * @param indexName - The name to use for this index. Must be a non-empty string.
   * @throws Will throw an error if the indexn name is not provided.
   */
  constructor(
    private httpClient: HttpClient,
    private vectorIndex: VectorIndex,
    private indexName: string
  ) {
    if (!indexName) {
      throw new Error("indexName is required when defining a SearchIndex");
    }
  }

  /**
   * Inserts or updates documents in the index.
   *
   * Documents are identified by their unique IDs. If a document with the same ID exists, it will be updated.
   *
   * @param params - A document or array of documents to upsert, including `id`, `content`, and optional `metadata`.
   * @returns A promise resolving to the result of the upsert operation.
   */
  upsert = async (
    params:
      | UpsertParameters<TContent, TIndexMetadata>
      | UpsertParameters<TContent, TIndexMetadata>[]
  ) => {
    const upsertParams = Array.isArray(params) ? params : [params];

    const path = ["upsert-data", this.indexName];
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
   * @param params - Search parameters including `query`, optional `limit`, optional `filter` and optional `reranking`.
   * @returns A promise resolving to an array of matching documents.
   */
  search = async (params: {
    query: string;
    limit?: number;
    filter?: string | TreeNode<TContent>;
    reranking?: boolean;
  }): Promise<SearchResult<TContent, TIndexMetadata>> => {
    const { query, limit = 5, filter, reranking } = params;

    const path = ["search", this.indexName];
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
