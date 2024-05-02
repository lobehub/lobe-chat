import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { PropsWithChildren } from 'react';

import SettingModalLayout from '../_layout/SettingModalLayout';

const CategoryContent = dynamic(
  () => import('@/app/(main)/settings/@category/features/CategoryContent'),
  { loading: () => <Skeleton paragraph={{ rows: 6 }} title={false} /> },
);
const UpgradeAlert = dynamic(() => import('@/app/(main)/settings/features/UpgradeAlert'), {});

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <SettingModalLayout
      category={
        <>
          <CategoryContent modal />
          <UpgradeAlert />
        </>
      }
    >
      {children}
    </SettingModalLayout>
  );
};

export default Layout;
