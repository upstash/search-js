import { afterEach, expect, spyOn, test } from "bun:test";
import { Search } from "../platforms/nodejs";
import type { RetryConfig } from "./search-client";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

const upsertAfterOneFailure = (retry: RetryConfig) => {
  const fetchMock = spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify({ result: "Success" })))
    .mockRejectedValueOnce(new TypeError("connection lost"));
  const client = new Search({
    url: "https://offline.invalid",
    token: "synthetic",
    enableTelemetry: false,
    retry,
  });
  const result = client.index("docs").upsert({ id: "doc-1", content: { title: "A" } });
  return { result, fetchMock };
};

test("retry: false does not send a second request", async () => {
  const { result, fetchMock } = upsertAfterOneFailure(false);
  await expect(result).rejects.toThrow("connection lost");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("retries: 1 still retries once", async () => {
  const { result, fetchMock } = upsertAfterOneFailure({ retries: 1, backoff: () => 0 });
  await expect(result).resolves.toBe("Success");
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
