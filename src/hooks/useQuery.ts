import { useSearchParams } from 'next/navigation';
import qs from 'query-string';

export const useQuery = () => {
  const rawQuery = useSearchParams();
  return qs.parse(rawQuery.toString());
};
