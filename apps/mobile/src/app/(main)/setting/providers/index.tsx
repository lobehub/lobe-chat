import { Empty, Flexbox, InputSearch, PageContainer } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { AlertCircle } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useProviderList } from './_features';
import ProviderCard from './_features/ProviderCard';
import ProviderListSkeleton from './_features/ProviderListSkeleton';
import SectionHeader from './_features/SectionHeader';
import { ProviderFlashListItem } from './_features/types';

const ProviderList = memo(() => {
  const [keyword, setKeyword] = useState('');
  const { t } = useTranslation('setting');

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
        return <Empty description={item.data.message} icon={AlertCircle} />;
      }

      default: {
        return null;
      }
    }
  }, []);

  const data = useMemo(() => {
    if (!keyword) return flashListData;

    const filtered = flashListData.filter((item) => {
      if (item.type === 'section-header') return false;
      if (item.type !== 'provider') return true;
      return item.id.toLowerCase().includes(keyword.toLowerCase());
    });

    // 搜索无结果时显示 Empty
    if (filtered.length === 0) {
      return [
        {
          data: { message: t('aiProviders.list.emptySearch', { ns: 'setting' }) },
          id: 'empty-search',
          type: 'empty',
        },
      ] as ProviderFlashListItem[];
    }

    return filtered;
  }, [flashListData, keyword, t]);

  // FlashList的keyExtractor
  const keyExtractor = useCallback((item: ProviderFlashListItem) => item.id, []);

  let content;

  // Loading状态
  if (isLoading) {
    content = <ProviderListSkeleton />;
  } else if (error) {
    content = (
      <Empty
        description={t('aiProviders.list.loadFailed', { ns: 'setting' })}
        flex={1}
        icon={AlertCircle}
      />
    );
  } else {
    content = (
      <FlashList
        data={data}
        drawDistance={400}
        getItemType={(item) => item.type}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <PageContainer largeTitleEnabled showBack title={t('providers', { ns: 'setting' })}>
      <Flexbox padding={16}>
        <InputSearch
          glass
          onChangeText={setKeyword}
          placeholder={t('providersSearchPlaceholder', { ns: 'setting' })}
          variant={'filled'}
        />
      </Flexbox>
      {content}
    </PageContainer>
  );
});

ProviderList.displayName = 'ProviderList';

export default ProviderList;
