import { useRouter } from 'next/navigation';
import qs, { type ParsedQuery } from 'query-string';

import { useQuery } from '@/hooks/useQuery';

export const useQueryRoute = () => {
  const router = useRouter();
  const parseQuery = useQuery();

  return {
    push: (url: string, query?: ParsedQuery) =>
      router.push(qs.stringifyUrl({ query: { ...parseQuery, ...query }, url })),
    replace: (url: string, query?: ParsedQuery) =>
      router.replace(qs.stringifyUrl({ query: { ...parseQuery, ...query }, url })),
  };
};
