import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { discoverService } from '@/services/discover';

import CategoryContainer from '../../features/CategoryContainer';
import Category from '../features/Category';

const Layout = async ({ children }: PropsWithChildren) => {
  const categoryList = await discoverService.getProviderList('en');

  return (
    <Flexbox gap={24} horizontal style={{ position: 'relative' }} width={'100%'}>
      <CategoryContainer>
        <Category data={categoryList} />
      </CategoryContainer>
      <Flexbox flex={1} gap={16}>
        {children}
      </Flexbox>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopDiscoverModelsLayout';

export default Layout;
