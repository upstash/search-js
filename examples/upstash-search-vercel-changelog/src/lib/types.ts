

export type VercelContent = {
  title: string,
  content: string,
  authors: string
}

export type VercelMetadata = {
  url: string,
  updated: string,
  kind: "blog" | "changelog"
}

export type SearchAPIResponse = {
  results: {
    id: string;
    key: string;
    content?: {
      content: VercelContent;
      metadata?: VercelMetadata;
    };
  }[];
  query: string;
  filters: {
    dateFrom?: string;
    dateUntil?: string;
    contentType?: string;
  };
}
