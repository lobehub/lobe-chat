import { useSearchParams } from 'react-router-dom';

import { FilesTabs } from '@/types/files';

export const useFileCategory = (): [FilesTabs, (category: FilesTabs) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = (searchParams.get('category') as FilesTabs) || FilesTabs.All;

  const setCategory = (newCategory: FilesTabs) => {
    if (newCategory === FilesTabs.All) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', newCategory);
    }
    setSearchParams(searchParams);
  };

  return [category, setCategory];
};
