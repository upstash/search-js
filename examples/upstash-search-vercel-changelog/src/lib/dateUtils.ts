export const toHumanReadableDate =
  (date: string): string => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",  // "Jan"
      day: "numeric",  // 12
      year: "numeric"  // 2026
    });
};
