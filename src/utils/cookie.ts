import dayjs from 'dayjs';

import { COOKIE_CACHE_DAYS } from '@/const/settings';

export const setCookie = (key: string, value: string | undefined) => {
  const expires = dayjs().add(COOKIE_CACHE_DAYS, 'day').toISOString();

  // eslint-disable-next-line unicorn/no-document-cookie
  document.cookie = `${key}=${value};expires=${expires};path=/;`;
};
