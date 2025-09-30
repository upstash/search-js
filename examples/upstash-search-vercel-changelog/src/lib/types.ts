

export type VercelContent = {
  title: string,
  content: string,
  authors: string
}

export type VercelMetadata = {
  dateInt: number,
  url: string,
  updated: string,
  kind: "blog" | "changelog"
}

export type SearchAPIResponse = {
  results: {
    content: VercelContent;
    metadata?: VercelMetadata;
    score: number;
    id: string;
  }[];
  query: string;
  filters: {
    dateFrom?: string;
    dateUntil?: string;
    contentType?: string;
  };
}