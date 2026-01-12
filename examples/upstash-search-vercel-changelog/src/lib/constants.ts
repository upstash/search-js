import { s } from "@upstash/redis";

export const INDEX_NAME = "vercel-changelog";
export const INDEX_PREFIX = "vercel-changelog";
export const SCHEMA = s.object({
  title: s.string().noStem(),
  content: s.string(),
  authors: s.string().noStem(),
  dateInt: s.number(),
  updated: s.date(),
  url: s.string().noTokenize(),
  kind: s.string().noTokenize(),
});