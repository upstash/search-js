import type { NextApiRequest, NextApiResponse } from 'next'
import { crawlAndIndex } from "@upstash/search-crawler"
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { docsUrl, index } = req.body;
    const upstashUrl = process.env.NEXT_PUBLIC_UPSTASH_SEARCH_URL!
    const upstashRestToken = process.env.UPSTASH_SEARCH_REST_TOKEN!

    if (!docsUrl || !upstashUrl || !upstashRestToken) {
      return res.status(500).json({ error: "Missing Upstash Search configuration" });
    }
    
    const result = await crawlAndIndex({
        upstashUrl,
        upstashToken: upstashRestToken,
        indexName: index || "default",
        docUrl: docsUrl,
    })

    return res.status(200).json(result)
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}