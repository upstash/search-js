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

// Type definitions for FilterTree with strict operations
// A leaf must have exactly one field with exactly one operation
type Leaf<TContent> = {
  [Field in keyof TContent]: {
    [K in Field]: ValidOperations<TContent[K]>;
  } & {
    [K in Exclude<keyof TContent, Field>]?: never;
  };
}[keyof TContent];

export type TreeNode<TContent> =
  | Leaf<TContent>
  | { OR: TreeNode<TContent>[] }
  | { AND: TreeNode<TContent>[] };

const valueFormatter = (value: string | boolean | number | any[]): string | number | boolean => {
  return Array.isArray(value)
    ? `(${value.map((v) => (typeof v === "string" ? `'${v}'` : v)).join(", ")})`
    : typeof value === "string"
      ? `'${value}'`
      : value;
};

// Recursive function to construct filter string from FilterTree
export function constructFilterString<TContent>(filterTree: TreeNode<TContent>): string {
  if ("OR" in filterTree) {
    return `(${filterTree.OR.map((node: TreeNode<TContent>) => constructFilterString(node)).join(" OR ")})`;
  }
  if ("AND" in filterTree) {
    return `(${filterTree.AND.map((node: TreeNode<TContent>) => constructFilterString(node)).join(" AND ")})`;
  }

  const field = Object.keys(filterTree)[0] as keyof TContent;
  const operationObj = (filterTree as Leaf<TContent>)[field];
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
