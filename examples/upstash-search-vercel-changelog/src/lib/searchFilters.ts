import { dateToInt } from "./dateUtils";

type FieldBoostAmount = Record<string, number>;

export const fieldBoostAmount: FieldBoostAmount = {
  title: 10,
  content: 1,
};

function buildFieldFilters(fieldName: string, query: string, tokens: string[]) {
  return [
    ...tokens.flatMap((token) => [
      { [fieldName]: { $eq: token, $boost: 10 } },
      {
        [fieldName]: {
          $fuzzy: { value: token, distance: 2, transpositionCostOne: true },
          $boost: 5,
        },
      },
      { [fieldName]: { $fuzzy: { value: token, distance: 1 }, $boost: 1 } },
      { [fieldName]: { $regex: `${token}.*`, $boost: 5 } },
    ]),
    ...(tokens.length > 1
      ? [
          { [fieldName]: { $phrase: query, $boost: 20 } },
          { [fieldName]: { $phrase: { value: query, slop: 3 }, $boost: 10 } },
        ]
      : []),
  ];
}

export function buildSearchFilter(
  query: string,
  dateFrom?: number,
  dateUntil?: number,
  contentType?: string
) {
  const tokens = query.split(/\s+/);

  const mustFilter = [
    ...(dateFrom ? [{ dateInt: { $gte: dateFrom } }] : []),
    ...(dateUntil ? [{ dateInt: { $lte: dateUntil } }] : []),
    ...(contentType && contentType !== "all"
      ? [{ kind: { $eq: contentType } }]
      : []),
  ];

  const shouldFilter = Object.keys(fieldBoostAmount).map((fieldName) => ({
    $should: buildFieldFilters(fieldName, query, tokens),
    $boost: fieldBoostAmount[fieldName],
  }));

  return mustFilter.length
    ? {
        $must: mustFilter,
        $should: shouldFilter,
      }
    : {
        $should: shouldFilter,
      };
}
