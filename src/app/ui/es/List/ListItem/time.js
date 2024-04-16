import dayjs from 'dayjs';
export var getChatItemTime = function getChatItemTime(updateAt) {
  var time = dayjs(updateAt);
  if (time.isSame(dayjs(), 'day')) return time.format('HH:mm');
  return time.format('MM-DD');
};