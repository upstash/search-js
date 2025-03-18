import type { Index as VectorIndex } from "@upstash/vector";
import { SearchIndex } from "./search-index";

export class Search {
  protected vectorIndex: VectorIndex;

  constructor(vectorIndex: VectorIndex) {
    this.vectorIndex = vectorIndex;
  }

  index = <TIndexMetadata extends Record<string, unknown> = Record<string, unknown>>(
    namespace: string
  ): SearchIndex<TIndexMetadata> => {
    return new SearchIndex<TIndexMetadata>(this.vectorIndex, namespace);
  };

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
