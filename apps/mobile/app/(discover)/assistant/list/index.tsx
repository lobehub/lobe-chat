import React, { useState } from 'react';
import useSWR from 'swr';
import { FlatList, Text, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AssistantService } from '@/mobile/services/assistant';
import { AssistantCategory } from '@/mobile/types/discover';
import { Search } from 'lucide-react-native';
import { CapsuleTabs } from '@/mobile/components';
import AgentCard from './components/AgentCard';
import SkeletonList from './components/SkeletonList';
import useCategory from './hooks/useCategory';
import { useStyles } from './styles';

const DISCOVER_ASSISTANTS_KEY = 'discover-assistants';

const AssistantList = () => {
  const { styles, token } = useStyles();
  const { t, i18n } = useTranslation(['common']);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(AssistantCategory.All);
  const categories = useCategory();

  const {
    data: agents,
    error,
    isLoading,
  } = useSWR([DISCOVER_ASSISTANTS_KEY, i18n.language], async ([, language]: [string, string]) => {
    const assistantService = new AssistantService();
    const data = await assistantService.getAssistantList(language);
    return data || [];
  });

  const filteredAgents = agents?.filter((agent) => {
    const matchesCategory =
      selectedCategory === AssistantCategory.All || agent.meta.category === selectedCategory;
    const matchesSearch =
      !searchText ||
      agent.meta.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      agent.meta.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      agent.meta.tags?.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
        <SkeletonList />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('assistant.fetchError', { ns: 'common' })}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Search color={token.colorTextPlaceholder} size={20} style={styles.searchIcon} />
          <TextInput
            onChangeText={setSearchText}
            placeholder={t('assistant.search', { ns: 'common' })}
            placeholderTextColor={token.colorTextPlaceholder}
            style={[styles.searchInput, { marginLeft: token.marginXS }]}
            textAlignVertical="center"
            value={searchText}
          />
        </View>

        <CapsuleTabs
          items={categories}
          onSelect={setSelectedCategory}
          selectedKey={selectedCategory}
        />
      </View>

      <FlatList
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchText
                ? t('assistant.noMatch', { ns: 'common' })
                : t('assistant.noData', { ns: 'common' })}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        data={filteredAgents}
        keyExtractor={(item) => item.identifier}
        renderItem={({ item }) => <AgentCard item={item} />}
      />
    </SafeAreaView>
  );
};

export default AssistantList;
