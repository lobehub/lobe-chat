import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_LANG } from '@/const/locale';
import { DiscoverService } from '@/server/services/discover';

import CategoryContainer from '../../../components/CategoryContainer';
import Category from '../features/Category';

const Layout = async ({ children }: PropsWithChildren) => {
  const discoverService = new DiscoverService();
  const categoryList = await discoverService.getProviderList(DEFAULT_LANG);

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
