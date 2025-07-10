import { describe, test, expect } from "bun:test";
import { constructFilterString } from "./metadata";

describe("constructFilterString", () => {
  // String operations tests
  describe("String operations", () => {
    test("should handle string equals operation", () => {
      const filter = { name: { equals: "John" } };
      expect(constructFilterString(filter)).toBe("name = 'John'");
    });

    test("should handle string notEquals operation", () => {
      const filter = { name: { notEquals: "John" } };
      expect(constructFilterString(filter)).toBe("name != 'John'");
    });

    test("should handle string glob operation", () => {
      const filter = { name: { glob: "John*" } };
      expect(constructFilterString(filter)).toBe("name GLOB 'John*'");
    });

    test("should handle string notGlob operation", () => {
      const filter = { name: { notGlob: "John*" } };
      expect(constructFilterString(filter)).toBe("name NOT GLOB 'John*'");
    });

    test("should handle string in operation", () => {
      const filter = { name: { in: ["John", "Jane", "Bob"] } };
      expect(constructFilterString(filter)).toBe("name IN ('John', 'Jane', 'Bob')");
    });

    test("should handle string notIn operation", () => {
      const filter = { name: { notIn: ["John", "Jane"] } };
      expect(constructFilterString(filter)).toBe("name NOT IN ('John', 'Jane')");
    });

    test("should handle empty string values", () => {
      const filter = { name: { equals: "" } };
      expect(constructFilterString(filter)).toBe("name = ''");
    });

    test("should handle string with special characters", () => {
      const filter = { name: { equals: 'John\'s "data"' } };
      expect(constructFilterString(filter)).toBe("name = 'John's \"data\"'");
    });
  });

  // Number operations tests
  describe("Number operations", () => {
    test("should handle number equals operation", () => {
      const filter = { age: { equals: 25 } };
      expect(constructFilterString(filter)).toBe("age = 25");
    });

    test("should handle number notEquals operation", () => {
      const filter = { age: { notEquals: 25 } };
      expect(constructFilterString(filter)).toBe("age != 25");
    });

    test("should handle number lessThan operation", () => {
      const filter = { age: { lessThan: 30 } };
      expect(constructFilterString(filter)).toBe("age < 30");
    });

    test("should handle number lessThanOrEquals operation", () => {
      const filter = { age: { lessThanOrEquals: 30 } };
      expect(constructFilterString(filter)).toBe("age <= 30");
    });

    test("should handle number greaterThan operation", () => {
      const filter = { age: { greaterThan: 18 } };
      expect(constructFilterString(filter)).toBe("age > 18");
    });

    test("should handle number greaterThanOrEquals operation", () => {
      const filter = { age: { greaterThanOrEquals: 18 } };
      expect(constructFilterString(filter)).toBe("age >= 18");
    });

    test("should handle number in operation", () => {
      const filter = { age: { in: [18, 25, 30] } };
      expect(constructFilterString(filter)).toBe("age IN (18, 25, 30)");
    });

    test("should handle number notIn operation", () => {
      const filter = { age: { notIn: [18, 25] } };
      expect(constructFilterString(filter)).toBe("age NOT IN (18, 25)");
    });

    test("should handle negative numbers", () => {
      const filter = { temperature: { equals: -10 } };
      expect(constructFilterString(filter)).toBe("temperature = -10");
    });

    test("should handle floating point numbers", () => {
      const filter = { score: { equals: 98.5 } };
      expect(constructFilterString(filter)).toBe("score = 98.5");
    });

    test("should handle zero values", () => {
      const filter = { count: { equals: 0 } };
      expect(constructFilterString(filter)).toBe("count = 0");
    });
  });

  // Boolean operations tests
  describe("Boolean operations", () => {
    test("should handle boolean equals true operation", () => {
      const filter = { active: { equals: true } };
      expect(constructFilterString(filter)).toBe("active = true");
    });

    test("should handle boolean equals false operation", () => {
      const filter = { active: { equals: false } };
      expect(constructFilterString(filter)).toBe("active = false");
    });

    test("should handle boolean notEquals operation", () => {
      const filter = { active: { notEquals: true } };
      expect(constructFilterString(filter)).toBe("active != true");
    });

    test("should handle boolean in operation", () => {
      const filter = { active: { in: [true, false] } } as any;
      expect(constructFilterString(filter)).toBe("active IN (true, false)");
    });

    test("should handle boolean notIn operation", () => {
      const filter = { active: { notIn: [true] } } as any;
      expect(constructFilterString(filter)).toBe("active NOT IN (true)");
    });
  });

  // Array operations tests
  describe("Array operations", () => {
    test("should handle array contains operation", () => {
      const filter = { tags: { contains: "javascript" } } as any;
      expect(constructFilterString(filter)).toBe("tags CONTAINS 'javascript'");
    });

    test("should handle array notContains operation", () => {
      const filter = { tags: { notContains: "python" } } as any;
      expect(constructFilterString(filter)).toBe("tags NOT CONTAINS 'python'");
    });

    test("should handle array contains with number", () => {
      const filter = { scores: { contains: 95 } } as any;
      expect(constructFilterString(filter)).toBe("scores CONTAINS 95");
    });

    test("should handle array notContains with boolean", () => {
      const filter = { flags: { notContains: true } } as any;
      expect(constructFilterString(filter)).toBe("flags NOT CONTAINS true");
    });
  });

  // OR operations tests
  describe("OR operations", () => {
    test("should handle simple OR operation", () => {
      const filter = {
        OR: [{ name: { equals: "John" } }, { name: { equals: "Jane" } }],
      } as any;
      expect(constructFilterString(filter)).toBe("(name = 'John' OR name = 'Jane')");
    });

    test("should handle OR with different fields", () => {
      const filter = {
        OR: [{ name: { equals: "John" } }, { age: { equals: 25 } }],
      } as any;
      expect(constructFilterString(filter)).toBe("(name = 'John' OR age = 25)");
    });

    test("should handle OR with multiple conditions", () => {
      const filter = {
        OR: [
          { name: { equals: "John" } },
          { name: { equals: "Jane" } },
          { age: { greaterThan: 30 } },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe("(name = 'John' OR name = 'Jane' OR age > 30)");
    });
  });

  // AND operations tests
  describe("AND operations", () => {
    test("should handle simple AND operation", () => {
      const filter = {
        AND: [{ name: { equals: "John" } }, { age: { greaterThan: 18 } }],
      } as any;
      expect(constructFilterString(filter)).toBe("(name = 'John' AND age > 18)");
    });

    test("should handle AND with multiple conditions", () => {
      const filter = {
        AND: [
          { name: { equals: "John" } },
          { age: { greaterThan: 18 } },
          { active: { equals: true } },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe("(name = 'John' AND age > 18 AND active = true)");
    });

    test("should handle AND with same field different operations", () => {
      const filter = {
        AND: [{ age: { greaterThan: 18 } }, { age: { lessThan: 65 } }],
      } as any;
      expect(constructFilterString(filter)).toBe("(age > 18 AND age < 65)");
    });
  });

  // Nested operations tests
  describe("Nested operations", () => {
    test("should handle nested OR within AND", () => {
      const filter = {
        AND: [
          { active: { equals: true } },
          {
            OR: [{ name: { equals: "John" } }, { name: { equals: "Jane" } }],
          },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe(
        "(active = true AND (name = 'John' OR name = 'Jane'))"
      );
    });

    test("should handle nested AND within OR", () => {
      const filter = {
        OR: [
          {
            AND: [{ name: { equals: "John" } }, { age: { greaterThan: 18 } }],
          },
          { active: { equals: false } },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe(
        "((name = 'John' AND age > 18) OR active = false)"
      );
    });

    test("should handle deeply nested operations", () => {
      const filter = {
        AND: [
          { category: { equals: "tech" } },
          {
            OR: [
              {
                AND: [{ name: { equals: "John" } }, { age: { greaterThan: 25 } }],
              },
              { priority: { equals: "high" } },
            ],
          },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe(
        "(category = 'tech' AND ((name = 'John' AND age > 25) OR priority = 'high'))"
      );
    });
  });

  // Edge cases and error handling
  describe("Edge cases and error handling", () => {
    test("should handle single item in array for IN operation", () => {
      const filter = { name: { in: ["John"] } } as any;
      expect(constructFilterString(filter)).toBe("name IN ('John')");
    });

    test("should handle empty array for IN operation", () => {
      const filter = { name: { in: [] } } as any;
      expect(constructFilterString(filter)).toBe("name IN ()");
    });

    test("should handle mixed types in array for IN operation", () => {
      const filter = { values: { in: ["string", 123, true] } } as any;
      expect(constructFilterString(filter)).toBe("values IN ('string', 123, true)");
    });

    test("should throw error for invalid operation", () => {
      const filter = { name: { invalidOp: "value" } } as any;
      expect(() => constructFilterString(filter)).toThrow();
    });

    test("should throw error for undefined value", () => {
      const filter = { name: { equals: undefined } } as any;
      expect(() => constructFilterString(filter)).toThrow();
    });

    test("should throw error for missing operation", () => {
      const filter = { name: {} } as any;
      expect(() => constructFilterString(filter)).toThrow();
    });
  });

  // Complex real-world scenarios
  describe("Complex real-world scenarios", () => {
    test("should handle user search with multiple filters", () => {
      const filter = {
        AND: [
          { status: { equals: "active" } },
          { age: { greaterThanOrEquals: 18 } },
          {
            OR: [
              { department: { in: ["engineering", "design"] } },
              { role: { glob: "*manager*" } },
            ],
          },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe(
        "(status = 'active' AND age >= 18 AND (department IN ('engineering', 'design') OR role GLOB '*manager*'))"
      );
    });

    test("should handle product filtering scenario", () => {
      const filter = {
        AND: [
          { category: { equals: "electronics" } },
          { price: { lessThan: 1000 } },
          { inStock: { equals: true } },
          {
            OR: [{ brand: { in: ["Apple", "Samsung"] } }, { rating: { greaterThan: 4.5 } }],
          },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe(
        "(category = 'electronics' AND price < 1000 AND inStock = true AND (brand IN ('Apple', 'Samsung') OR rating > 4.5))"
      );
    });

    test("should handle content filtering with tags", () => {
      const filter = {
        OR: [
          { tags: { contains: "javascript" } },
          {
            AND: [
              { author: { equals: "John Doe" } },
              { publishDate: { greaterThan: "2023-01-01" } },
            ],
          },
          { featured: { equals: true } },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe(
        "(tags CONTAINS 'javascript' OR (author = 'John Doe' AND publishDate > '2023-01-01') OR featured = true)"
      );
    });

    test("should handle exclusion filters", () => {
      const filter = {
        AND: [
          { status: { notEquals: "deleted" } },
          { category: { notIn: ["spam", "test"] } },
          { content: { notGlob: "*temp*" } },
          { tags: { notContains: "deprecated" } },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe(
        "(status != 'deleted' AND category NOT IN ('spam', 'test') AND content NOT GLOB '*temp*' AND tags NOT CONTAINS 'deprecated')"
      );
    });

    test("should handle date range filtering", () => {
      const filter = {
        AND: [
          { startDate: { greaterThanOrEquals: "2023-01-01" } },
          { endDate: { lessThanOrEquals: "2023-12-31" } },
          { status: { equals: "published" } },
        ],
      } as any;
      expect(constructFilterString(filter)).toBe(
        "(startDate >= '2023-01-01' AND endDate <= '2023-12-31' AND status = 'published')"
      );
    });
  });
});
