import { SectionList, View, Text } from 'react-native';
import isEqual from 'fast-deep-equal';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/selectors';
import { useStyles } from './styles';

import ProviderCard from './(components)/ProviderCard';
import ProviderListSkeleton from './(components)/ProviderListSkeleton';

const ProviderList = () => {
  const { styles } = useStyles();

  // 获取store数据和方法
  const { useFetchAiProviderList } = useAiInfraStore();

  // 使用SWR获取provider列表
  const { isLoading, error } = useFetchAiProviderList();

  // 使用store selectors来响应状态变化
  const enabledProviders = useAiInfraStore(aiProviderSelectors.enabledAiProviderList, isEqual);
  const disabledProviders = useAiInfraStore(aiProviderSelectors.disabledAiProviderList, isEqual);

  // Loading状态
  if (isLoading) {
    return <ProviderListSkeleton />;
  }

  // Error状态
  if (error) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.label}>Failed to load providers</Text>
      </View>
    );
  }

  // 准备SectionList数据
  const sections = [
    {
      count: enabledProviders.length,
      data: enabledProviders,
      title: 'Enabled',
    },
    {
      count: disabledProviders.length,
      data: disabledProviders,
      title: 'Disabled',
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
  );
};

export default ProviderList;
