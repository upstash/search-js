import { Index as VectorIndex } from "@upstash/vector";
import { SearchIndex } from "./search-index";
import type { Dict } from "./types";
import type { HttpClient } from "./client/search-client";

/**
 * Provides search capabilities over indexes.
 */
export class Search {
  protected vectorIndex: VectorIndex;

  /**
   * Creates a new Search instance.
   *
   * @param vectorIndex - The underlying index used for search operations.
   */
  constructor(private client: HttpClient) {
    this.vectorIndex = new VectorIndex(client);
  }

  /**
   * Returns a SearchIndex instance for a given index.
   *
   * Each index is an isolated collection where documents can be added,
   * retrieved, searched, and deleted.
   *
   * @param indexName - The name to use as an index.
   * @returns A SearchIndex instance for managing documents within the index.
   */
  index = <TContent extends Dict = Dict, TIndexMetadata extends Dict = Dict>(
    indexName: string
  ): SearchIndex<TContent, TIndexMetadata> => {
    return new SearchIndex<TContent, TIndexMetadata>(this.client, this.vectorIndex, indexName);
  };

  /**
   * Retrieves a list of all available indexes.
   *
   * @returns An array of strings representing the names of available indexes.
   */
  listIndexes = async () => {
    return await this.vectorIndex.listNamespaces();
  };

  /**
   * Retrieves overall search index statistics.
   *
   * This includes disk usage, total document count, pending document count,
   * and details about each available index.
   *
   * @returns An object containing search system metrics and index details.
   */
  info = async () => {
    const { indexSize, namespaces, pendingVectorCount, vectorCount } =
      await this.vectorIndex.info();

    const indexes = Object.fromEntries(
      Object.entries(namespaces).map((namespace) => [
        namespace[0],
        {
          pendingDocumentCount: namespace[1].pendingVectorCount,
          documentCount: namespace[1].vectorCount,
        },
      ])
    );

    return {
      diskSize: indexSize,
      pendingDocumentCount: pendingVectorCount,
      documentCount: vectorCount,
      indexes,
    };
  };
}
