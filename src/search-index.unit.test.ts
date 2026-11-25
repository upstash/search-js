import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Search } from "./platforms/nodejs";

/** Offline tests for the request paths of an index, with a recording fetch. */
const BASE_URL = "https://search.example.com";

const originalFetch = globalThis.fetch;
let paths: string[] = [];

const resultOf = (path: string): unknown => {
  if (path.startsWith("/range/")) return { nextCursor: "", vectors: [] };
  if (path.startsWith("/search/") || path.startsWith("/fetch/")) return [];
  if (path.startsWith("/delete/")) return { deleted: 0 };
  return "Success";
};

beforeEach(() => {
  paths = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    // parse the url like a server would receive it, so that dot segments, `?` and `#` take effect
    const url = new URL(input instanceof Request ? input.url : input.toString());
    paths.push(url.pathname + url.search);
    return Response.json({ result: resultOf(url.pathname) });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const client = new Search({ url: BASE_URL, token: "token", retry: false });

const callEveryMethod = async (indexName: string) => {
  const index = client.index(indexName);
  await index.upsert({ id: "1", content: { text: "hello" } });
  await index.search({ query: "hello" });
  await index.fetch(["1"]);
  await index.delete(["1"]);
  await index.range({ cursor: "", limit: 1 });
  await index.reset();
};

const endpoints = ["upsert-data", "search", "fetch", "delete", "range", "reset"];

describe("index names in request paths", () => {
  test("a plain name is sent as it is", async () => {
    await callEveryMethod("my-index");

    expect(paths).toEqual(endpoints.map((endpoint) => `/${endpoint}/my-index`));
  });

  for (const indexName of ["a?b", "a#b", "a b", "tenant:1", "user@example.com", "a+b", "çağ"]) {
    test(`every method addresses the same index for "${indexName}"`, async () => {
      await callEveryMethod(indexName);

      const segment = encodeURIComponent(indexName);
      expect(paths).toEqual(endpoints.map((endpoint) => `/${endpoint}/${segment}`));
      expect(decodeURIComponent(segment)).toBe(indexName);
    });
  }

  test("a number is used as the name", async () => {
    await callEveryMethod(42 as unknown as string);

    expect(paths).toEqual(endpoints.map((endpoint) => `/${endpoint}/42`));
  });

  for (const indexName of [
    ".",
    "..",
    "../reset",
    "../reset?all",
    "a/b",
    String.raw`a\b`,
    String.raw`..\reset`,
    "a%2Fb",
    "%2e%2e",
    "a\nb",
    "a\tb",
  ]) {
    test(`rejects ${JSON.stringify(indexName)} without sending a request`, () => {
      expect(() => client.index(indexName)).toThrow("Index name");
      expect(paths).toEqual([]);
    });
  }

  test("rejects a value which is not a name", () => {
    expect(() => client.index({} as unknown as string)).toThrow("Index name must be a string.");
    expect(() => client.index("")).toThrow("indexName is required");
  });
});
