type MutuallyExclusives<TFields extends string, TParameter> = {
  [P in TFields]: { [Q in P]: Q extends "in" | "notIn" ? TParameter[] : TParameter } & {
    [R in Exclude<TFields, P>]?: never;
  };
}[TFields];

type StringOperation = "equals" | "notEquals" | "glob" | "notGlob" | "in" | "notIn";

type NumberOperation =
  | "equals"
  | "notEquals"
  | "lessThan"
  | "lessThanOrEquals"
  | "greaterThan"
  | "greaterThanOrEquals"
  | "in"
  | "notIn";

type BooleanOperation = "equals" | "notEquals" | "in" | "notIn";

type ArrayOperation = "contains" | "notContains";

// Map operations to their string representations
const operationMap: Record<string, string> = {
  equals: "=",
  notEquals: "!=",
  lessThan: "<",
  lessThanOrEquals: "<=",
  greaterThan: ">",
  greaterThanOrEquals: ">=",
  glob: "GLOB",
  notGlob: "NOT GLOB",
  in: "IN",
  notIn: "NOT IN",
  contains: "CONTAINS",
  notContains: "NOT CONTAINS",
};

type ValidOperations<T> = T extends number
  ? MutuallyExclusives<NumberOperation, T>
  : T extends string
    ? MutuallyExclusives<StringOperation, T>
    : T extends boolean
      ? MutuallyExclusives<BooleanOperation, T>
      : T extends any[]
        ? MutuallyExclusives<ArrayOperation, any>
        : never;

// Merge TContent and TMetadata, prefixing metadata keys with @metadata.
type MergedFields<TContent, TMetadata> = TContent & {
  [K in keyof TMetadata as `@metadata.${string & K}`]: TMetadata[K];
};

// Type definitions for FilterTree with strict operations
// A leaf must have exactly one field with exactly one operation
type Leaf<TFields> = {
  [Field in keyof TFields]: {
    [K in Field]: ValidOperations<TFields[K]>;
  } & {
    [K in Exclude<keyof TFields, Field>]?: never;
  };
}[keyof TFields];

export type TreeNode<TContent, TMetadata> =
  | Leaf<MergedFields<TContent, TMetadata>>
  | { OR: TreeNode<TContent, TMetadata>[] }
  | { AND: TreeNode<TContent, TMetadata>[] };

const valueFormatter = (value: string | boolean | number | any[]): string | number | boolean => {
  return Array.isArray(value)
    ? `(${value.map((v) => (typeof v === "string" ? `'${v}'` : v)).join(", ")})`
    : typeof value === "string"
      ? `'${value}'`
      : value;
};

// Recursive function to construct filter string from FilterTree
export function constructFilterString<TContent, TMetadata>(filterTree: TreeNode<TContent, TMetadata>): string {
  if ("OR" in filterTree) {
    return `(${filterTree.OR.map((node: TreeNode<TContent, TMetadata>) => constructFilterString(node)).join(" OR ")})`;
  }
  if ("AND" in filterTree) {
    return `(${filterTree.AND.map((node: TreeNode<TContent, TMetadata>) => constructFilterString(node)).join(" AND ")})`;
  }

  const field = Object.keys(filterTree)[0];
  const operationObj = (filterTree as Record<string, any>)[field];
  const operation = Object.keys(operationObj)[0];
  const value = operationObj[operation as keyof typeof operationObj];

  if (!operation || value === undefined) {
    throw new Error(
      `Invalid filter operation for field ${String(field)}: ${JSON.stringify(operationObj)}`
    );
  }

  const mappedOperation = operationMap[operation];
  if (!mappedOperation) {
    throw new Error(`Invalid filter operation for field ${String(field)}: ${operation}`);
  }

  const formattedValue = valueFormatter(value);

  return `${String(field)} ${mappedOperation} ${formattedValue}`;
}
