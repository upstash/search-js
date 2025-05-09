import type { Index as VectorIndex } from "@upstash/vector";
import { SearchIndex } from "./search-index";

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
  constructor(vectorIndex: VectorIndex) {
    this.vectorIndex = vectorIndex;
  }

  /**
   * Returns a SearchIndex instance for a given index.
   *
   * Each index is an isolated collection where documents can be added,
   * retrieved, searched, and deleted.
   *
   * @param namespace - The namespace to use as an index.
   * @returns A SearchIndex instance for managing documents within the namespace.
   */
  index = <TIndexMetadata extends Record<string, unknown> = Record<string, unknown>>(
    namespace: string
  ): SearchIndex<TIndexMetadata> => {
    return new SearchIndex<TIndexMetadata>(this.vectorIndex, namespace);
  };

  /**
   * Retrieves a list of all available indexes.
   *
   * @returns An array of strings representing the names of available indexes.
   */
  listIndexes = async () => {
    const indexes = await this.vectorIndex.listNamespaces();
    return indexes.filter(Boolean);
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
      Object.entries(namespaces)
        .filter((namespace) => namespace[0] !== "")
        .map((namespace) => [
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
