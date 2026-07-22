import { startOfMonth, startOfWeek, addDays } from 'date-fns';

export const parseValueToDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day);
    }
    const fallbackDate = new Date(value);
    if (!Number.isNaN(fallbackDate.getTime())) {
      return new Date(
        fallbackDate.getUTCFullYear(),
        fallbackDate.getUTCMonth(),
        fallbackDate.getUTCDate()
      );
    }
  }
  return null;
};

export const getDaysForMonth = (currentDate) => {
  const monthStart = startOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  
  const days = [];
  let dayCursor = startDate;
  for (let i = 0; i < 42; i++) {
    days.push(dayCursor);
    dayCursor = addDays(dayCursor, 1);
  }
  
  return {
    monthStart,
    days
  };
};
