import qs from 'query-string';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook to get query parameters
 * React Router version for (main) directory
 */
export const useQuery = () => {
  const [searchParams] = useSearchParams();
  return useMemo(() => qs.parse(searchParams.toString()), [searchParams]);
};
