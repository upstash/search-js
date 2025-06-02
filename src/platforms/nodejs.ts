import * as core from "./../search";
import { HttpClient, type RequesterConfig } from "../client/search-client";
import { UpstashError } from "../client/error";
import { getRuntime, VERSION } from "../client/telemetry";

/**
 * Connection credentials for upstash vector.
 * Get them from https://console.upstash.com/vector/<uuid>
 */
export type ClientConfig = {
  /**
   * UPSTASH_SEARCH_REST_URL
   */
  url?: string;
  /**
   * UPSTASH_SEARCH_REST_TOKEN
   */
  token?: string;

  /**
   * Enable telemetry to help us improve the SDK.
   * The sdk will send the sdk version, platform and node version as telemetry headers.
   *
   * @default true
   */
  enableTelemetry?: boolean;
} & RequesterConfig;

/**
 * Provides search capabilities over indexes.
 */
export class Search extends core.Search {
  /**
   * Creates a new Search instance.
   *
   * @param vectorIndex - The underlying index used for search operations.
   */
  constructor(params: ClientConfig) {
    const token =
      params?.token ??
      process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_TOKEN ??
      process.env.UPSTASH_VECTOR_REST_TOKEN;
    const url =
      params?.url ??
      process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL ??
      process.env.UPSTASH_VECTOR_REST_URL;

    if (!token) {
      throw new UpstashError("UPSTASH_SEARCH_REST_TOKEN is missing!");
    }
    if (!url) {
      throw new UpstashError("UPSTASH_SEARCH_REST_URL is missing!");
    }

    if (url.startsWith(" ") || url.endsWith(" ") || /\r|\n/.test(url)) {
      console.warn("The vector url contains whitespace or newline, which can cause errors!");
    }
    if (token.startsWith(" ") || token.endsWith(" ") || /\r|\n/.test(token)) {
      console.warn("The vector token contains whitespace or newline, which can cause errors!");
    }

    const enableTelemetry = process.env.UPSTASH_DISABLE_TELEMETRY
      ? false
      : (params?.enableTelemetry ?? true);

    const telemetryHeaders: Record<string, string> = enableTelemetry
      ? {
          "Upstash-Telemetry-Sdk": `upstash-search-js@${VERSION}`,
          "Upstash-Telemetry-Platform": process.env.VERCEL
            ? "vercel"
            : process.env.AWS_REGION
              ? "aws"
              : "unknown",
          "Upstash-Telemetry-Runtime": getRuntime(),
        }
      : {};

    const client = new HttpClient({
      baseUrl: url,
      retry: params?.retry,
      headers: { authorization: `Bearer ${token}`, ...telemetryHeaders },
      cache: params?.cache === false ? undefined : params?.cache || "no-store",
    });

    super(client);
  }

  /**
   * Creates a new Search instance using env variables
   * `UPSTASH_SEARCH_REST_URL` and
   * `UPSTASH_SEARCH_REST_TOKEN`
   *
   * @param env
   * @returns
   */
  static fromEnv = (
    env?: {
      UPSTASH_SEARCH_REST_URL: string;
      UPSTASH_SEARCH_REST_TOKEN: string;
    },
    config?: Omit<ClientConfig, "url" | "token">
  ) => {
    const url = env?.UPSTASH_SEARCH_REST_URL || process?.env.UPSTASH_SEARCH_REST_URL;
    const token = env?.UPSTASH_SEARCH_REST_TOKEN || process?.env.UPSTASH_SEARCH_REST_TOKEN;

    return new Search({ url, token, ...config });
  };
}
