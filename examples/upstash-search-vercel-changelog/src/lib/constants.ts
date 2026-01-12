import { s } from "@upstash/redis";

export const INDEX_NAME = "vercel-changelog-4";
export const INDEX_PREFIX = "vercel-changelog-2";
export const SCHEMA = s.object({
  title: s.string().noStem(),
  content: s.string(),
  authors: s.string().noStem(),
  updated: s.date(),
  url: s.string().noTokenize(),
  kind: s.string().noTokenize(),
});