import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, SafeAreaView, Text, View } from 'react-native';

import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';

import { useStyles } from './styles';
import ProviderInfoSection from './(components)/ProviderInfoSection';
import ModelsSection from './(components)/ModelsSection';

const ProviderDetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { styles } = useStyles();

  // 获取provider详细信息
  const { useFetchAiProviderItem } = useAiInfraStore();
  const { data: providerDetail, isLoading, error } = useFetchAiProviderItem(id!);
  // 获取provider配置状态
  const isConfigLoading = useAiInfraStore(aiProviderSelectors.isAiProviderConfigLoading(id!));

  // 动态设置页面标题
  useEffect(() => {
    if (providerDetail?.name) {
      navigation.setOptions({
        headerTitle: providerDetail.name,
        title: providerDetail.name,
      });
    } else if (id) {
      navigation.setOptions({
        headerTitle: id,
        title: id,
      });
    }
  }, [navigation, providerDetail?.name, id]);

  if (isLoading || isConfigLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading provider configuration...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load provider configuration</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        style={styles.content}
      >
        {/* Provider基本信息 */}
        <ProviderInfoSection provider={providerDetail!} />

        {/*<ConfigurationSection provider={providerDetail!} />*/}

        {/* Model列表区域 */}
        <ModelsSection providerId={id!} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderDetailPage;
