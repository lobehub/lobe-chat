import { useParams, useSearchParams } from 'react-router-dom';

import { FilesTabs } from '@/types/files';

/**
 * Hook to manage file category filter in URL search params
 * Uses react-router-dom instead of nuqs for MemoryRouter compatibility
 */
export const useFileCategory = (): [string, (value: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();

  // If there's an ID in the path, default to Pages instead of Home
  const defaultCategory = id ? FilesTabs.Pages : FilesTabs.Home;
  const category = searchParams.get('category') ?? defaultCategory;

  const setCategory = (value: string) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);

        if (value === FilesTabs.Home) {
          // Clear on default
          newParams.delete('category');
        } else {
          newParams.set('category', value);
        }

        return newParams;
      },
      { replace: true },
    );
  };

  return [category, setCategory];
};
