'use client';

import { SearchBar } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra/store';

import AddNew from './AddNew';
import ProviderList from './List';
import SearchResult from './SearchResult';
import SkeletonList from './SkeletonList';

interface ProviderMenuProps {
  children: ReactNode;
  mobile?: boolean;
}
const Layout = memo(({ children, mobile }: ProviderMenuProps) => {
  const { t } = useTranslation('modelProvider');
  const theme = useTheme();

  const [providerSearchKeyword, useFetchAiProviderList] = useAiInfraStore((s) => [
    s.providerSearchKeyword,
    s.useFetchAiProviderList,
    s.initAiProviderList,
  ]);

  useFetchAiProviderList();

  const width = mobile ? undefined : 260;
  return (
    <Flexbox style={{ minWidth: width, overflow: mobile ? undefined : 'scroll' }} width={width}>
      <Flexbox
        gap={8}
        horizontal
        justify={'space-between'}
        padding={'16px 12px 12px'}
        style={{ background: theme.colorBgLayout, position: 'sticky', top: 0, zIndex: 50 }}
        width={'100%'}
      >
        <SearchBar
          allowClear
          onChange={(e) => useAiInfraStore.setState({ providerSearchKeyword: e.target.value })}
          placeholder={t('menu.searchProviders')}
          style={{ width: '100%' }}
          type={'block'}
          value={providerSearchKeyword}
        />
        <AddNew />
      </Flexbox>
      {children}
    </Flexbox>
  );
});

const Content = () => {
  const [initAiProviderList, providerSearchKeyword] = useAiInfraStore((s) => [
    s.initAiProviderList,
    s.providerSearchKeyword,
  ]);

  // loading
  if (!initAiProviderList) return <SkeletonList />;

  // search
  if (!!providerSearchKeyword) return <SearchResult />;

  // default
  return <ProviderList />;
};

const ProviderMenu = ({ mobile }: { mobile?: boolean }) => (
  <Layout mobile={mobile}>
    <Content />
  </Layout>
);

export default ProviderMenu;
