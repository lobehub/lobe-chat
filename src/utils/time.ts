import dayjs, { Dayjs } from 'dayjs';

const getQuarterStart = (date: Dayjs) => {
  const month = date.month();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  return date.month(quarterStartMonth).startOf('month');
};

export const today = () => dayjs().startOf('day');
export const thisWeek = () => dayjs().startOf('week');
export const thisMonth = () => dayjs().startOf('month');
export const thisQuarter = () => getQuarterStart(today());
export const thisYear = () => dayjs().startOf('year');

export const hoursAgo = (hours: number) => dayjs().subtract(hours, 'hours').startOf('hours');

export const daysAgo = (days: number) => dayjs().subtract(days, 'days').startOf('day');

export const weeksAgo = (weeks: number) => dayjs().subtract(weeks, 'week').startOf('week');

export const monthsAgo = (months: number) => dayjs().subtract(months, 'month').startOf('month');

export const lastMonth = () => monthsAgo(1).endOf('month');
