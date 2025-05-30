export type { QueryResult, Index as VectorIndex } from "@upstash/vector";

export type Dict = Record<string, unknown>;

export type CommandParameters<TNonFieldsParams, TIndexMetadata> = keyof TIndexMetadata extends never
  ? TNonFieldsParams & { metadata?: never }
  : TNonFieldsParams & { metadata: TIndexMetadata };

export type UpsertParameters<TContent extends Dict, TIndexMetadata extends object> = CommandParameters<
  { id: string; content: TContent },
  TIndexMetadata
>;

export type Document<TContent extends Dict, TMetadata extends object, TWithScore extends boolean = false> = {
  id: string;
  content: TContent;
  metadata?: TMetadata;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
} & (TWithScore extends true ? { score: number } : {});

export type SearchResult<TContent extends Dict, TMetadata extends object> = Document<TContent, TMetadata, true>[]