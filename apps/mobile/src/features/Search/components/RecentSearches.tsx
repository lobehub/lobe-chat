import { ActionIcon, Cell, Center, Empty, useTheme } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { ClockIcon, Trash2Icon, XIcon } from 'lucide-react-native';
import { memo, useCallback } from 'react';

interface RecentSearchesProps {
  /**
   * 空状态提示文本（翻译 key 或直接文本）
   */
  emptyDescription: string;
  /**
   * 清空按钮点击事件
   */
  onClear: () => void;
  /**
   * 搜索项点击事件
   */
  onItemClick: (query: string) => void;
  /**
   * 搜索项删除事件
   */
  onItemRemove: (query: string) => void;
  /**
   * 最近搜索标题（翻译 key 或直接文本）
   */
  recentSearchesTitle: string;
  /**
   * 搜索历史列表
   */
  searches: string[];
}

const RecentSearches = memo<RecentSearchesProps>(
  ({ searches, onItemClick, onItemRemove, onClear, recentSearchesTitle, emptyDescription }) => {
    const theme = useTheme();

    // 渲染固定标题
    const renderHeader = useCallback(
      () => (
        <Cell
          extra={
            <ActionIcon
              color={theme.colorTextDescription}
              hitSlop={8}
              icon={Trash2Icon}
              onPress={onClear}
              size={14}
            />
          }
          paddingBlock={2}
          pressEffect={false}
          showArrow={false}
          title={recentSearchesTitle}
          titleProps={{
            color: theme.colorTextDescription,
            fontSize: 14,
          }}
        />
      ),
      [theme.colorTextDescription, onClear, recentSearchesTitle],
    );

    // 渲染列表项
    const renderItem = useCallback(
      ({ item }: { item: string }) => (
        <Cell
          extra={
            <ActionIcon
              color={theme.colorTextDescription}
              hitSlop={8}
              icon={XIcon}
              onPress={(e) => {
                e.stopPropagation();
                onItemRemove(item);
              }}
              size={14}
            />
          }
          icon={ClockIcon}
          iconProps={{
            color: theme.colorTextDescription,
          }}
          iconSize={16}
          onPress={() => onItemClick(item)}
          paddingBlock={2}
          showArrow={false}
          title={item}
          titleProps={{
            ellipsis: true,
            fontSize: 14,
            weight: 'normal',
          }}
        />
      ),
      [theme.colorTextDescription, onItemClick, onItemRemove],
    );

    // 键提取器
    const keyExtractor = useCallback((item: string) => `search-${item}`, []);

    // 空状态
    if (searches.length === 0) {
      return (
        <Center paddingBlock={48}>
          <Empty description={emptyDescription} />
        </Center>
      );
    }

    return (
      <FlashList
        ListHeaderComponent={renderHeader}
        data={searches}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    );
  },
);

RecentSearches.displayName = 'RecentSearches';

export default RecentSearches;
