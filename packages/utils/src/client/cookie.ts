import dayjs from 'dayjs';

export const COOKIE_CACHE_DAYS = 30;

export const setCookie = (
  key: string,
  value: string | undefined,
  expireDays: string | number = COOKIE_CACHE_DAYS,
) => {
  if (typeof value === 'undefined') {
    // Set the expiration time to yesterday (expire immediately)
    const expiredDate = new Date(0).toUTCString(); // 1970-01-01T00:00:00Z

    // eslint-disable-next-line unicorn/no-document-cookie
    document.cookie = `${key}=; expires=${expiredDate}; path=/;`;
  } else {
    const expires =
      typeof expireDays === 'string'
        ? expireDays
        : dayjs().add(expireDays, 'day').toDate().toUTCString();

    // eslint-disable-next-line unicorn/no-document-cookie
    document.cookie = `${key}=${value};expires=${expires};path=/;`;
  }
};
