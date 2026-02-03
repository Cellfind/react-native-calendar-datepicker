import dayjs from 'dayjs';

const toDayjs = (value) => {
  if (dayjs.isDayjs && dayjs.isDayjs(value)) {
    return value;
  }
  if (value && typeof value === 'object' && typeof value.toDate === 'function') {
    return dayjs(value.toDate());
  }
  return dayjs(value);
};

export default toDayjs;
