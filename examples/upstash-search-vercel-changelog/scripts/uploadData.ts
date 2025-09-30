import { Search } from "@upstash/search";
import { getEntries } from './parser';
import { dateToInt } from '@/lib/dateUtils';
import { VercelContent, VercelMetadata } from '@/lib/types';
import { NAMESPACE } from '@/lib/constants';

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

const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const index = client.index<VercelContent, VercelMetadata>(NAMESPACE);

// upsert 100 entries at a time
const BATCH_SIZE = 100;

for (let i = 0; i < formatedEntries.length; i += BATCH_SIZE) {
  const batch = formatedEntries.slice(i, i + BATCH_SIZE);
  console.log(`Upserting entries ${i} to ${i + batch.length}...`);

  await index.upsert(batch);
}

console.log("All entries upserted.");