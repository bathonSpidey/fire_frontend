export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The view opens on the current month: receipts show up here as soon as they are uploaded.
export const getInitialPeriod = () => {
  const now = new Date();
  return { month: MONTHS[now.getMonth()], year: now.getFullYear() };
};

// Nothing is paid in advance, so there is nothing to look at beyond the current month.
export const isLatestPeriod = (month: string, year: number): boolean => {
  const now = new Date();
  return year * 12 + MONTHS.indexOf(month) >= now.getFullYear() * 12 + now.getMonth();
};

export const clampToNow = (month: string, year: number) => {
  const now = new Date();
  if (year > now.getFullYear()) return { month: MONTHS[now.getMonth()], year: now.getFullYear() };
  if (year === now.getFullYear() && MONTHS.indexOf(month) > now.getMonth()) {
    return { month: MONTHS[now.getMonth()], year };
  }
  return { month, year };
};

export const getNextMonthPeriod = (currentMonth: string, currentYear: number) => {
  let index = MONTHS.indexOf(currentMonth) + 1;
  let year = currentYear;

  if (index > 11) {
    index = 0;
    year += 1;
  }
  return { month: MONTHS[index], year };
};

export const getPrevMonthPeriod = (currentMonth: string, currentYear: number) => {
  let index = MONTHS.indexOf(currentMonth) - 1;
  let year = currentYear;

  if (index < 0) {
    index = 11;
    year -= 1;
  }
  return { month: MONTHS[index], year };
};