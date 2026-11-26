---
title: "Serverless and Edge Setup"
description: "Configure Upstash Search JS in Node.js serverless and Cloudflare Workers with minimal friction."
---

This guide shows how to use the SDK in serverless and edge runtimes where long‑lived TCP connections are not ideal. You will configure credentials, create a `Search` client, and run a minimal search request.

**Problem**
You need a lightweight search client that works in serverless or edge runtimes without sockets, while still supporting retries, cache control, and typed documents.

**Solution**
Use the platform‑specific entry points and let the SDK construct a connectionless HTTP client. The Node.js entry can load credentials from the environment, while Cloudflare Workers typically pass secrets explicitly.

<Steps>
<Step>
### Configure environment variables
For Node.js (serverless or traditional), set the REST URL and token:

```bash
export UPSTASH_SEARCH_REST_URL="<your-rest-url>"
export UPSTASH_SEARCH_REST_TOKEN="<your-rest-token>"
```

For Vercel/Next.js, use the same variable names or `NEXT_PUBLIC_` variants if you must read them in client code.
</Step>
<Step>
### Create a client and index
Use the entry point that matches your runtime.

<Tabs items={['Node.js', 'Cloudflare Workers']}>
<Tab value="Node.js">
```ts index.ts
import { Search } from "@upstash/search";

type Doc = { text: string };

const client = Search.fromEnv();
const index = client.index<Doc>("notes");
```
</Tab>
<Tab value="Cloudflare Workers">
```ts worker.ts
import { Search } from "@upstash/search/cloudflare";

type Doc = { text: string };

const client = new Search({
  url: env.UPSTASH_SEARCH_REST_URL,
  token: env.UPSTASH_SEARCH_REST_TOKEN,
});

const index = client.index<Doc>("notes");
```
</Tab>
</Tabs>
</Step>
<Step>
### Perform a minimal search
```ts index.ts
await index.upsert({ id: "n1", content: { text: "hello serverless" } });
const results = await index.search({ query: "hello", limit: 1 });

return new Response(JSON.stringify(results));
```
</Step>
</Steps>

**Complete runnable example (Node.js API route)**
```ts api/search.ts
import { Search } from "@upstash/search";

const client = Search.fromEnv();
const index = client.index<{ text: string }>("notes");

export async function handler(req: Request) {
  const { q } = await req.json();

  const results = await index.search({
    query: typeof q === "string" ? q : "",
    limit: 5,
  });

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}
```

If you run this handler with `q = "hello"`, you should receive an array of matching documents with scores.
