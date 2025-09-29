export const dateToInt = (date: Date): number => {
  const epoch = new Date(1970, 0, 1);
  const diff = date.getTime() - epoch.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const intToDate = (int: number): Date => {
  const epoch = new Date(1970, 0, 1);
  const date = new Date(epoch.getTime() + int * (1000 * 60 * 60 * 24));
  return date;
};
