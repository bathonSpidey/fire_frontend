export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getInitialPeriod = () => {
  const currentDate = new Date();
  let monthIndex = currentDate.getMonth() - 1; // Current Month - 1
  let year = currentDate.getFullYear();

  // Handle underflow adjustment for January (Index 0 - 1 = -1 -> December previous year)
  if (monthIndex < 0) {
    monthIndex = 11;
    year -= 1;
  }

  return {
    month: MONTHS[monthIndex],
    year,
  };
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