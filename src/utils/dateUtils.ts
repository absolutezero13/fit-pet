export const getLocalDateKey = (dateInput: Date | string): string => {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const shiftDateByDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};
