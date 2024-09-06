import { useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useMemo } from 'react';

export const useQuery = () => {
  const rawQuery = useSearchParams();
  return useMemo(() => qs.parse(rawQuery.toString()), [rawQuery]);
};
