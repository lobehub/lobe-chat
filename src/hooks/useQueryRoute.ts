import { useRouter } from 'next/navigation';
import qs, { type ParsedQuery } from 'query-string';
import { useMemo } from 'react';

import { isOnServerSide } from '@/utils/env';

interface QueryRouteOptions {
  hash?: string;
  query?: ParsedQuery;
  replace?: boolean;
  replaceHash?: boolean;
  withHash?: boolean;
}

interface GenHrefOptions extends QueryRouteOptions {
  prevQuery?: ParsedQuery;
  url: string;
}

const genHref = ({ hash, replace, url, prevQuery = {}, query = {} }: GenHrefOptions): string => {
  let href = qs.stringifyUrl({ query: replace ? query : { ...prevQuery, ...query }, url });

  if (!isOnServerSide && hash) {
    href = [href, hash || location?.hash?.slice(1)].filter(Boolean).join('#');
  }

  return href;
};

export const useQueryRoute = () => {
  const router = useRouter();

  return useMemo(
    () => ({
      push: (url: string, options: QueryRouteOptions = {}) => {
        const prevQuery = qs.parse(window.location.search);

        return router.push(genHref({ prevQuery, url, ...options }));
      },
      replace: (url: string, options: QueryRouteOptions = {}) => {
        const prevQuery = qs.parse(window.location.search);
        return router.replace(genHref({ prevQuery, url, ...options }));
      },
    }),
    [],
  );
};
