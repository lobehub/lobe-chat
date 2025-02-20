'use client';

import { memo } from 'react';

import Cell from '@/components/Cell';

import { useCategory } from './useCategory';

const Category = memo(() => {
  const items = useCategory();

  return items?.map((item, index) => <Cell {...item} key={item.key || index} />);
});

export default Category;
