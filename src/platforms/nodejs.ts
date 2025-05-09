import { Index, type IndexConfig } from "@upstash/vector/nodejs";
import * as core from "./../search";

/**
 * Provides search capabilities over indexes.
 */
export class Search extends core.Search {
  /**
   * Creates a new Search instance.
   *
   * @param vectorIndex - The underlying index used for search operations.
   */
  constructor(params: IndexConfig) {
    const index = new Index(params);
    super(index);
  }

  /**
   * Creates a new Search instance using env variables
   * `UPSTASH_SEARCH_REST_URL` and
   * `UPSTASH_SEARCH_REST_TOKEN`
   *
   * @param env
   * @returns
   */
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
