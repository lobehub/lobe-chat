import { PropsWithChildren, ReactNode, memo } from 'react';

import ResponsiveLayout from '@/layout/ServerResponsiveLayout';
import { SettingsTabs } from '@/store/global/initialState';

import DesktopLayout from './(desktop)/layout.responsive';
import MobileLayout from './(mobile)/layout.mobile';

export interface SettingLayoutProps {
  activeTab: SettingsTabs;
  children: ReactNode;
}
const SettingLayout = memo<SettingLayoutProps>(({ children, ...res }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout} {...res}>
    {children}
  </ResponsiveLayout>
));

export default SettingLayout;
