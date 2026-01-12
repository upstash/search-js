import { Redis } from "@upstash/redis";
import { getEntries } from './parser';
import { dateToInt } from '@/lib/dateUtils';
import { VercelContent, VercelMetadata } from '@/lib/types';
import { INDEX_NAME, INDEX_PREFIX, SCHEMA } from '@/lib/constants';

const entries = await getEntries()

const formatedEntries = entries.map((entry, index) => {
  const dateObj = new Date(entry.updated);
  const dateInt = dateToInt(dateObj)
  const kind = entry.link.includes("/blog/") ? "blog" : "changelog";

  return {
    id: `${index}-${entry.id}`,
    content: {
      title: entry.title,
      content: entry.content,
      authors: entry.author.join(', ')
    } satisfies VercelContent,
    metadata: {
      dateInt,
      url: entry.link,
      updated: entry.updated,
      kind
    } satisfies VercelMetadata
  }
})

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create the index (will be used for upserting data)
const index = await redis.search.createIndex({
  name: INDEX_NAME,
  schema: SCHEMA,
  dataType: "hash",
  prefix: `${INDEX_PREFIX}:`,
});

console.log(`Created search index: ${INDEX_NAME}`);

// upsert 100 entries at a time
const BATCH_SIZE = 100;

for (let i = 0; i < formatedEntries.length; i += BATCH_SIZE) {
  const batch = formatedEntries.slice(i, i + BATCH_SIZE);
  console.log(`Upserting entries ${i} to ${i + batch.length}...`);

  for (const entry of batch) {
    const key = `${INDEX_NAME}:${entry.id}`;
    await redis.hset(key, {
      ...entry.content,
      ...entry.metadata,
    });
  }
}

console.log("All entries upserted. Waiting for indexing...");
await index.waitIndexing();
console.log("Indexing complete!");