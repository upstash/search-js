import type { Index as VectorIndex } from "@upstash/vector";

type CommandParameters<TNonFieldsParams, TIndexMetadata> = keyof TIndexMetadata extends never
  ? TNonFieldsParams & { fields?: never }
  : TNonFieldsParams & { fields: TIndexMetadata };

type UpsertParameters<TIndexMetadata extends Record<string, unknown>> = CommandParameters<
  { id: string; data: string },
  TIndexMetadata
>;

/**
 * Represents a search index for managing and querying documents.
 * 
 * Each SearchIndex instance operates within a specific index, allowing for
 * isolated document storage and retrieval. It provides methods to upsert, search,
 * fetch, delete, and manage documents within the index.
 *
 * @template TIndexMetadata - Metadata shape associated with each document.
 */
export class SearchIndex<TIndexMetadata extends Record<string, unknown> = Record<string, unknown>> {
  private vectorIndex: VectorIndex;
  private namespace: string;

  /**
   * Initializes a new SearchIndex instance for the specified namespace.
   * 
   * @param vectorIndex - The underlying vector index used for search operations.
   * @param namespace - The namespace to use for this index. Must be a non-empty string.
   * @throws Will throw an error if the namespace is not provided.
   */
  constructor(vectorIndex: VectorIndex, namespace: string) {
    this.vectorIndex = vectorIndex;

    if (!namespace) {
      throw new Error("Namespace is required when defining a SearchIndex");
    }

    this.namespace = namespace;
  }

  /**
   * Inserts or updates documents in the index.
   * 
   * Documents are identified by their unique IDs. If a document with the same ID exists, it will be updated.
   * 
   * @param params - A document or array of documents to upsert, including `id`, `data`, and optional `fields`.
   * @returns A promise resolving to the result of the upsert operation.
   */
  upsert = async (
    params: UpsertParameters<TIndexMetadata> | UpsertParameters<TIndexMetadata>[]
  ) => {
    const arrayParams = Array.isArray(params) ? params : [params];
    const upsertParams = arrayParams.map(({ id, data, fields }) => ({
      id,
      data,
      metadata: fields,
    }));

    return await this.vectorIndex.upsert(upsertParams, { namespace: this.namespace });
  };

  /**
   * Searches for documents matching a query string.
   * 
   * Returns documents that best match the provided query, optionally filtered and limited in number.
   * 
   * @param params - Search parameters including `query`, optional `limit`, and optional `filter`.
   * @returns A promise resolving to an array of matching documents.
   */
  search = async (params: { query: string; limit?: number; filter?: string }) => {
    const { query, limit = 5, filter } = params;

    const result = await this.vectorIndex.query(
      { data: query, topK: limit, filter, includeData: true, includeMetadata: true },
      { namespace: this.namespace }
    );

    return result.map(({ id, data, metadata }) => ({
      id,
      data,
      fields: metadata,
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
      namespace: this.namespace,
      includeData: true,
      includeMetadata: true,
    });

    return result.map((fetchResult) => {
      if (!fetchResult) return fetchResult;

      return {
        id: fetchResult.id,
        data: fetchResult.data,
        fields: fetchResult.metadata,
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
    return await this.vectorIndex.delete(params, { namespace: this.namespace });
  };

  /**
   * Retrieves documents within a specific range, with pagination support.
   * 
   * Useful for paginating through large result sets by providing a `cursor`.
   * 
   * @param params - Range parameters including `cursor`, `limit`, and ID `prefix`.
   * @returns A promise resolving to the next cursor and documents in the range.
   */
  range = async (params: { cursor: number | string; limit: number; prefix: string }) => {
    const { nextCursor, vectors } = await this.vectorIndex.range(
      { ...params, includeData: true, includeMetadata: true },
      { namespace: this.namespace }
    );

    return {
      nextCursor,
      documents: vectors.map(({ id, data, metadata }) => ({
        id,
        data,
        fields: metadata,
      })),
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
    return await this.vectorIndex.reset({ namespace: this.namespace });
  };

  /**
   * Deletes the entire index and all its documents.
   * 
   * Use with caution, as this operation is irreversible.
   * 
   * @returns A promise resolving to the result of the delete operation.
   */
  deleteIndex = async () => {
    return await this.vectorIndex.deleteNamespace(this.namespace);
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
    const { pendingVectorCount, vectorCount } = info.namespaces[this.namespace] ?? {
      pendingVectorCount: 0,
      vectorCount: 0,
    };

    return {
      pendingDocumentCount: pendingVectorCount,
      documentCount: vectorCount,
    };
  };
}
