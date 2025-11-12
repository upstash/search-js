import type { Requester, UpstashRequest, UpstashResponse } from "@upstash/vector";
import { UpstashError } from "./error";

type CacheSetting =
  | "default"
  | "force-cache"
  | "no-cache"
  | "no-store"
  | "only-if-cached"
  | "reload"
  | false;

export type RetryConfig =
  | false
  | {
      /**
       * The number of retries to attempt before giving up.
       *
       * @default 5
       */
      retries?: number;
      /**
       * A backoff function receives the current retry cound and returns a number in milliseconds to wait before retrying.
       *
       * @default
       * ```ts
       * Math.exp(retryCount) * 50
       * ```
       */
      backoff?: (retryCount: number) => number;
    };

export type RequesterConfig = {
  /**
   * Configure the retry behaviour in case of network errors
   */
  retry?: RetryConfig;

  /**
   * Configure the cache behaviour
   * @default "no-store"
   */
  cache?: CacheSetting;
};

export type HttpClientConfig = {
  headers?: Record<string, string>;
  baseUrl: string;
  retry?: RetryConfig;
} & RequesterConfig;

export class HttpClient implements Requester {
  public baseUrl: string;
  public headers: Record<string, string>;
  public readonly options: {
    cache?: CacheSetting;
  };

  public readonly retry: {
    attempts: number;
    backoff: (retryCount: number) => number;
  };

  public constructor(config: HttpClientConfig) {
    this.options = {
      cache: config.cache,
    };

    this.baseUrl = config.baseUrl.replace(/\/$/, "");

    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    this.retry =
      typeof config?.retry === "boolean" && config?.retry === false
        ? {
            attempts: 1,
            backoff: () => 0,
          }
        : {
            attempts: config?.retry?.retries ?? 5,
            backoff: config?.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50),
          };
  }

  public async request<TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult> & { enrichedInput?: string }> {
    const requestOptions = {
      cache: this.options.cache,
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(req.body),
      keepalive: true,
    };

    let res: Response | null = null;
    let error: Error | null = null;
    for (let i = 0; i <= this.retry.attempts; i++) {
      try {
        res = await fetch([this.baseUrl, ...(req.path ?? [])].join("/"), requestOptions);
        break;
      } catch (error_) {
        error = error_ as Error;
        if (i < this.retry.attempts) {
          await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
        }
      }
    }
    if (!res) {
      throw error ?? new Error("Exhausted all retries");
    }

    const body = (await res.json()) as UpstashResponse<TResult>;
    if (!res.ok) {
      throw new UpstashError(`${body.error}`);
    }

    let enrichedInput = res.headers.get("Upstash-Vector-Enriched-Input") ?? undefined;
    if (enrichedInput) {
      enrichedInput = decodeURIComponent(enrichedInput.replaceAll('+', ' '));
    }

    return { result: body.result, error: body.error, enrichedInput };
  }
}
