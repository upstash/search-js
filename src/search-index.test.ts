import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { Search } from "./platforms/nodejs";

const client = Search.fromEnv();
const indexName = "test-index-name";
const searchIndex = client.index<{ text: string }, { key: string }>(indexName);

describe("SearchIndex", () => {
  beforeEach(async () => {
    // Ensure the namespace is empty before the tests
    await searchIndex.reset();

    // Insert test data
    await searchIndex.upsert([
      { id: "id1", content: { text: "test-data-1" }, metadata: { key: "value1" } },
      { id: "id2", content: { text: "test-data-2" }, metadata: { key: "value2" } },
      {
        id: "different-id3",
        content: { text: "different-test-data-3" },
        metadata: { key: "value3" },
      },
    ]);

    let info = await searchIndex.info();
    let counter = 0;
    while (info.pendingDocumentCount > 0) {
      await new Promise((r) => setTimeout(r, 500));
      info = await searchIndex.info();
      counter++;
      if (counter > 10) {
        throw new Error("Timeout waiting for pendingDocumentCount to be 0");
      }
    }
  });

  afterEach(async () => {
    // Clean up after tests
    await searchIndex.deleteIndex();
  });

  test("should upsert and retrieve data", async () => {
    const results = await searchIndex.fetch({ ids: ["id1", "id2"] });

    expect(results).toEqual([
      { id: "id1", content: { text: "test-data-1" }, metadata: { key: "value1" } },
      { id: "id2", content: { text: "test-data-2" }, metadata: { key: "value2" } },
    ]);
  });

  test("should search and return results", async () => {
    const results = await searchIndex.search({
      query: "test-data-1",
      limit: 2,
      filter: "text GLOB 'test*'",
    });

    expect(results).toEqual([
      {
        id: "id1",
        content: { text: "test-data-1" },
        metadata: { key: "value1" },
        score: expect.any(Number),
      },

      {
        content: { text: "test-data-2" },
        metadata: {
          key: "value2",
        },
        id: "id2",
        score: expect.any(Number),
      },
    ]);
  });

  test("should search with a filter", async () => {
    const results = await searchIndex.search({
      query: "test-data",
      limit: 2,
      filter: { AND: [{ text: { glob: "test-data-1" } }] },
    });

    expect(results).toEqual([
      {
        id: "id1",
        content: { text: "test-data-1" },
        metadata: { key: "value1" },
        score: expect.any(Number),
      },
    ]);
  });

  test("should delete a document", async () => {
    const deleteResult = await searchIndex.delete({ ids: ["id1"] });
    expect(deleteResult).toEqual({ deleted: 1 });

    const results = await searchIndex.fetch({ ids: ["id1"] });
    expect(results).toEqual([null]); // Ensure it's deleted
  });

  test("should get namespace info", async () => {
    const info = await searchIndex.info();

    expect(info).toMatchObject({
      documentCount: expect.any(Number),
      pendingDocumentCount: expect.any(Number),
    });
  });

  test("should reset the index", async () => {
    await searchIndex.reset();
    const results = await searchIndex.fetch({ ids: ["id2"] });

    expect(results).toEqual([null]); // Ensure it's cleared
  });

  test("should search within a range", async () => {
    const { nextCursor, documents } = await searchIndex.range({
      cursor: "0",
      limit: 1,
      prefix: "id",
    });

    expect(documents).toEqual([
      { id: "id1", content: { text: "test-data-1" }, metadata: { key: "value1" } },
    ]);

    const { documents: nextDocuments } = await searchIndex.range({
      cursor: nextCursor,
      limit: 5,
      prefix: "id",
    });

    expect(nextDocuments).toEqual([
      {
        content: { text: "test-data-2" },
        metadata: {
          key: "value2",
        },
        id: "id2",
      },
    ]);
  });
});
