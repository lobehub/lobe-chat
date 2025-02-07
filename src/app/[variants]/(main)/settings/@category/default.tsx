import { Suspense } from 'react';

import SkeletonLoading from '@/components/Loading/SkeletonLoading';

import UpgradeAlert from '../features/UpgradeAlert';
import CategoryContent from './features/CategoryContent';

const Category = () => {
  return (
    <Suspense fallback={<SkeletonLoading paragraph={{ rows: 7 }} title={false} />}>
      <CategoryContent />
      <UpgradeAlert />
    </Suspense>
  );
};

Category.displayName = 'SettingCategory';

export default Category;
