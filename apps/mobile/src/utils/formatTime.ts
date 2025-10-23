import dayjs from 'dayjs';

export const formatTime = (time: number): string => {
  const now = dayjs();
  const target = dayjs(time);

  if (target.isSame(now, 'day')) {
    return target.format('HH:mm:ss');
  } else if (target.isSame(now, 'year')) {
    return target.format('MM-DD HH:mm:ss');
  } else {
    return target.format('YYYY-MM-DD HH:mm:ss');
  }
};
