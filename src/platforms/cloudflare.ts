import { Index, type IndexConfig } from "@upstash/vector/cloudflare";
import * as core from "./../search";

export class Search extends core.Search {
  constructor(params: IndexConfig) {
    const index = new Index(params);
    super(index);
  }

  static fromEnv = (env?: {
    UPSTASH_SEARCH_REST_URL: string;
    UPSTASH_SEARCH_REST_TOKEN: string;
  }) => {
    const url = env?.UPSTASH_SEARCH_REST_URL || process?.env.UPSTASH_SEARCH_REST_URL;
    const token = env?.UPSTASH_SEARCH_REST_TOKEN || process?.env.UPSTASH_SEARCH_REST_TOKEN;

    if (!url) {
      throw new Error("Unable to find environment variable: `UPSTASH_SEARCH_REST_URL`");
    }

    if (!token) {
      throw new Error("Unable to find environment variable: `UPSTASH_SEARCH_REST_TOKEN`");
    }

    return new Search({ url, token });
  };
}
