import UpgradeAlert from '@/app/(main)/settings//features/UpgradeAlert';

import CategoryContent from './features/Category';

const Category = () => {
  return (
    <>
      <CategoryContent />
      <UpgradeAlert />
    </>
  );
};

Category.displayName = 'SettingCategory';

export default Category;
