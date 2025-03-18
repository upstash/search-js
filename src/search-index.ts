import type { Index as VectorIndex } from "@upstash/vector";

type CommandParameters<TNonFieldsParams, TIndexMetadata> = keyof TIndexMetadata extends never
  ? TNonFieldsParams & { fields?: never }
  : TNonFieldsParams & { fields: TIndexMetadata };

export class SearchIndex<TIndexMetadata extends Record<string, unknown> = Record<string, unknown>> {
  private vectorIndex: VectorIndex;
  private namespace: string;
  constructor(vectorIndex: VectorIndex, namespace: string) {
    this.vectorIndex = vectorIndex;
    this.namespace = namespace;
  }

  upsert = async (params: CommandParameters<{ id: string; data: string }, TIndexMetadata>) => {
    const { id, data, fields } = params;

    return await this.vectorIndex.upsert(
      { data, id, metadata: fields },
      { namespace: this.namespace }
    );
  };

  search = async (params: { query: string; limit?: number; filter?: string }) => {
    const { query, limit = 5, filter } = params; // TODO decide on the default limit

    const result = await this.vectorIndex.query(
      { data: query, topK: limit, filter, includeData: true, includeMetadata: true },
      { namespace: this.namespace }
    );

    return result.map(({ id, data, metadata }) => ({ id, data, fields: metadata }));
  };

  fetch = async (params: Parameters<VectorIndex["fetch"]>[0]) => {
    const result = await this.vectorIndex.fetch(params, {
      namespace: this.namespace,
      includeData: true,
      includeMetadata: true,
    });
    return result.map((fetchResult) => {
      if (!fetchResult) {
        return fetchResult;
      }
      return {
        id: fetchResult.id,
        data: fetchResult.data,
        fields: fetchResult.metadata,
      };
    });
  };

  delete = async (params: Parameters<VectorIndex["delete"]>[0]) => {
    return await this.vectorIndex.delete(params, { namespace: this.namespace });
  };

  range = async (params: { cursor: number | string; limit: number; prefix: string }) => {
    const { nextCursor, vectors } = await this.vectorIndex.range(
      { ...params, includeData: true, includeMetadata: true },
      { namespace: this.namespace }
    );
    return {
      nextCursor,
      documents: vectors.map(({ id, data, metadata }) => ({ id, data, fields: metadata })),
    };
  };

  reset = async () => {
    return await this.vectorIndex.reset({ namespace: this.namespace });
  };

  deleteIndex = async () => {
    return await this.vectorIndex.deleteNamespace(this.namespace);
  };

  info = async () => {
    const info = await this.vectorIndex.info();
    const { pendingVectorCount, vectorCount } = info.namespaces[this.namespace] ?? {
      pendingVectorCount: 0,
      vectorCount: 0,
    };
    return { pendingDocumentCount: pendingVectorCount, documentCount: vectorCount };
  };
}
