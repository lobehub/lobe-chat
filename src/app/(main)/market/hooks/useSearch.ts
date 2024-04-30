import { useRouter } from 'next/navigation';
import qs from 'query-string';

export const useSearch = () => {
  const router = useRouter();

  return (keywords: string) => {
    router.replace(qs.stringifyUrl({ query: { q: keywords }, url: '/market' }));
  };
};
