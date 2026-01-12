export const dateToInt = (date: Date): number => {
  const epoch = Date.UTC(1970, 0, 1);
  const utcTime = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  return Math.floor((utcTime - epoch) / (1000 * 60 * 60 * 24));
};

export const intToDate = (int: number): Date => {
  const epoch = Date.UTC(1970, 0, 1);
  const timestamp = epoch + int * (1000 * 60 * 60 * 24);
  return new Date(timestamp);
};

export const toDateString = ({
  dateInt,
  date,
}:
  | { dateInt: number; date?: never }
  | { dateInt?: never; date: Date }): string => {
  const resolvedDate = dateInt ? intToDate(dateInt) : (date as Date);
  return resolvedDate.toISOString().split("T")[0]; // YYYY-MM-DD format
};