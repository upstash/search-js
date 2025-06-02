export type { QueryResult, Index as VectorIndex } from "@upstash/vector";

export type Dict = Record<string, unknown>;

export type UpsertParameters<TContent extends Dict, TIndexMetadata extends Dict> = {
  id: string;
  content: TContent;
  metadata?: TIndexMetadata;
};

export type Document<
  TContent extends Dict,
  TMetadata extends Dict,
  TWithScore extends boolean = false,
> = {
  id: string;
  content: TContent;
  metadata?: TMetadata;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
} & (TWithScore extends true ? { score: number } : {});

export type SearchResult<TContent extends Dict, TMetadata extends Dict> = Document<
  TContent,
  TMetadata,
  true
>[];
