export const VERSION = "0.1.0";

export function getRuntime() {
  if (typeof process === "object" && typeof process.versions == "object" && process.versions.bun)
    return `bun@${process.versions.bun}`;

  // @ts-expect-error EdgeRuntime not recognized
  if (typeof typeof EdgeRuntime === "string") {
    return "edge-light";
  }

  if (typeof process === "object" && typeof process.version === "string") {
    return `node@${process.version}`;
  }

  return "Undetermined";
}
