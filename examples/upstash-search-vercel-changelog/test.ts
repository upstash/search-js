import { Redis, s } from "@upstash/redis";

export const INDEX_NAME = "vercel-changelog";

export const SCHEMA = s.object({
  content: s.object({
    title: s.string(),
    content: s.string(),
    authors: s.string(),
  }),
  metadata: s.object({
    dateInt: s.number("U64"),
    url: s.string(),
    updated: s.string(),
    kind: s.string().noTokenize(),
  }),
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const index = redis.search.index(INDEX_NAME, SCHEMA);

index.query({
  filter: {
    $and: [
      { "content.title": { $eq: "limit" } },
      { "metadata.kind": { $eq: "blog" } },
    ]
  },
  limit: 20
})

