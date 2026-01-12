import { s } from "@upstash/redis";

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