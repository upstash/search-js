cd ../..

bun install
bun run build

cd examples/nextjs-movies

pnpm i @upstash/search@file:../..