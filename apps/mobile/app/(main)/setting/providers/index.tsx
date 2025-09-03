import React from 'react';
import { SectionList, View, Text } from 'react-native';
import isEqual from 'fast-deep-equal';
import { useTranslation } from 'react-i18next';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/selectors';
import { useStyles } from './styles';

import ProviderCard from './(components)/ProviderCard';
import ProviderListSkeleton from './(components)/ProviderListSkeleton';
import { Header } from '@/components';

const ProviderList = () => {
  const { styles } = useStyles();
  const { t } = useTranslation(['setting']);

  // 获取store数据和方法
  const { useFetchAiProviderList } = useAiInfraStore();

  // 使用SWR获取provider列表
  const { isLoading, error } = useFetchAiProviderList();

  // 使用store selectors来响应状态变化
  const enabledProviders = useAiInfraStore(aiProviderSelectors.enabledAiProviderList, isEqual);
  const disabledProviders = useAiInfraStore(aiProviderSelectors.disabledAiProviderList, isEqual);

  // Loading状态
  if (isLoading) {
    return (
      <>
        <Header showBack title={t('providers', { ns: 'setting' })} />
        <ProviderListSkeleton />
      </>
    );
  }

  // Error状态
  if (error) {
    return (
      <>
        <Header showBack title={t('providers', { ns: 'setting' })} />
        <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={styles.label}>{t('aiProviders.list.loadFailed', { ns: 'setting' })}</Text>
        </View>
      </>
    );
  }

  // 准备SectionList数据
  const sections = [
    {
      count: enabledProviders.length,
      data: enabledProviders,
      title: t('aiProviders.list.enabled', { ns: 'setting' }),
    },
    {
      count: disabledProviders.length,
      data: disabledProviders,
      title: t('aiProviders.list.disabled', { ns: 'setting' }),
    },
  ].filter((section) => section.data.length > 0); // 只显示有数据的section

  // 渲染section header
  const renderSectionHeader = ({ section }: { section: { count: number; title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {section.title} ({section.count})
      </Text>
    </View>
  );

  return (
    <>
      <Header showBack title={t('providers', { ns: 'setting' })} />
      <View style={styles.container}>
        <SectionList
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProviderCard provider={item} />}
          renderSectionHeader={renderSectionHeader}
          sections={sections}
          stickySectionHeadersEnabled={true}
        />
      </View>
    </>
  );
};

export default ProviderList;
