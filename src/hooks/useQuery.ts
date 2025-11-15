import { useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useMemo } from 'react';

/**
 * Hook to get query parameters
 * This is the Next.js version
 * For React Router version, use useQuery from @/app/[variants]/(main)/hooks/useQuery
 */
export const useQuery = () => {
  const rawQuery = useSearchParams();
  return useMemo(() => qs.parse(rawQuery.toString()), [rawQuery]);
};
