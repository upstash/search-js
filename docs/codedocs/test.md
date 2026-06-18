---
title: "Components Showcase"
description: "Internal page used to validate MDX components and formatting conventions."
---

This page exists to validate the MDX component syntax and ensure the documentation build can render core components. It is not meant for end‑user documentation, but the content here is still written in a clear and consistent style to avoid build errors. If you are using this repository as a template, you can remove this page from navigation and treat it as a formatting reference for authors.

The most important rule is that MDX components in this project must not be self‑closing. Always use explicit opening and closing tags such as `<Card>...</Card>` or `<Callout>...</Callout>`. This page demonstrates that requirement with a simple set of components and a short narrative.

<Callout type="info">When adding new documentation pages, keep lists flat, escape pipe characters in tables, and ensure JSX attributes are space‑separated.</Callout>

Below is a simple Cards grid that is valid for this MDX setup:

<Cards>
  <Card title="Architecture" href="/docs/architecture">See how modules fit together</Card>
  <Card title="Core Concepts" href="/docs/search-client">Learn the main abstractions</Card>
  <Card title="API Reference" href="/docs/api-reference/search-nodejs">Explore the full API surface</Card>
</Cards>

If you want to test syntax locally, add a temporary page like this and verify that the build passes. Avoid adding non‑registered components or custom tags, as those will cause compilation errors in Fumadocs. Also avoid nested bullet lists; if you need hierarchy, use separate paragraphs or section headings instead.

This file is deliberately kept in plain English and uses the same frontmatter format as the rest of the docs, which helps catch issues with title and description parsing. Feel free to replace this content with a more specific internal style guide, or delete the file entirely if you manage navigation exclusively through `meta.json` and do not want a playground page.

If you keep the page, consider renaming it and adding it to the sidebar only for maintainers. It is useful as a smoke test after dependency upgrades because it exercises `Cards` and `Callout` rendering in the same build as the main documentation.
