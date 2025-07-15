export const VERSION = "0.1.0";

export function getRuntime() {
  if (typeof process === "object" && typeof process.versions == "object" && process.versions.bun)
    return `bun@${process.versions.bun}`;

  if (typeof process === "object" && typeof process.version === "string") {
    return `node@${process.version}`;
  }

  // @ts-expect-error EdgeRuntime not recognized
  if (typeof EdgeRuntime === "string") {
    return "edge-light";
  }

  return "undetermined";
}
