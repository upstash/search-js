import { describe, test, beforeAll, afterAll, expect } from "bun:test";
import { Search } from "./platforms/nodejs";
import { Index } from "@upstash/vector";

const client = Search.fromEnv();
const NAMESPACE = "test-namespace";
const searchIndex = client.index<{ text: string }, { key: string }>(NAMESPACE);
const vectorIndex = new Index({
  url: process.env.UPSTASH_SEARCH_REST_URL,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN,
});

describe("Search (Real Index)", () => {
  beforeAll(async () => {
    await searchIndex.reset(); // Clean namespace
    await searchIndex.upsert({
      id: "2",
      content: { text: "test-data-2" },
      metadata: { key: "value2" },
    });
    await searchIndex.upsert({
      id: "1",
      content: { text: "test-data-1" },
      metadata: { key: "value1" },
    });
  });

  afterAll(async () => {
    await searchIndex.deleteIndex(); // Clean up
    await vectorIndex.reset({ all: true });
  });

  test("should get overall index info", async () => {
    const info = await client.info();

    expect(info).toMatchObject({
      diskSize: expect.any(Number),
      pendingDocumentCount: expect.any(Number),
      documentCount: expect.any(Number),
      indexes: {
        [NAMESPACE]: {
          pendingDocumentCount: expect.any(Number),
          documentCount: expect.any(Number),
        },
      },
    });
  });
});
