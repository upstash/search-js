type FieldBoostAmount = Record<string, number>;

export const fieldBoostAmount: FieldBoostAmount = {
  title: 10,
  content: 1,
};

export function buildSearchFilter(
  query: string,
  dateFrom?: string,
  dateUntil?: string,
  contentType?: string
) {
  const mustFilter = [
    ...(dateFrom ? [{ updated: { $gte: dateFrom } }] : []),
    ...(dateUntil ? [{ updated: { $lte: dateUntil } }] : []),
    ...(contentType && contentType !== "all"
      ? [{ kind: { $eq: contentType } }]
      : []),
  ];

  const shouldFilter = Object.keys(fieldBoostAmount).map((fieldName) => ({
    $should: { [fieldName]: query },
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
