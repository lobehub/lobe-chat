import { Empty, PageContainer } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import ProviderCard from './features/ProviderCard';
import ProviderListSkeleton from './features/ProviderListSkeleton';
import SectionHeader from './features/SectionHeader';
import { useProviderList } from './hooks';
import { ProviderFlashListItem } from './types';

const ProviderList = memo(() => {
  const { t } = useTranslation(['setting']);

  // 使用自定义hook获取数据
  const { flashListData, isLoading, error } = useProviderList();

  // 统一的renderItem函数
  const renderItem = useCallback(({ item }: { item: ProviderFlashListItem }) => {
    switch (item.type) {
      case 'section-header': {
        return <SectionHeader count={item.data.count} title={item.data.title} />;
      }

      case 'provider': {
        return <ProviderCard provider={item.data} />;
      }

      case 'empty': {
        return <Empty description={item.data.message} />;
      }

      default: {
        return null;
      }
    }
  }, []);

  // FlashList的keyExtractor
  const keyExtractor = useCallback((item: ProviderFlashListItem) => item.id, []);

  let content;

  // Loading状态
  if (isLoading) {
    content = <ProviderListSkeleton />;
  } else if (error) {
    content = <Empty description={t('aiProviders.list.loadFailed', { ns: 'setting' })} flex={1} />;
  } else {
    content = (
      <FlashList
        data={flashListData}
        drawDistance={400}
        getItemType={(item) => item.type}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
      />
    );
  }

  return (
    <PageContainer largeTitleEnabled showBack title={t('providers', { ns: 'setting' })}>
      {content}
    </PageContainer>
  );
});

ProviderList.displayName = 'ProviderList';

export default ProviderList;
