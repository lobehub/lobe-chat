import emoji from 'emoji-datasource';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, LayoutChangeEvent, useWindowDimensions } from 'react-native';
import useMergeState from 'use-merge-value';

import Center from '../Center';
import Flexbox from '../Flexbox';
import Input from '../Input';
import Segmented from '../Segmented';
import { EmojiCell } from './components';
import {
  Categories,
  categoryKeys,
  charFromEmojiObject,
  emojiByCategory,
  sortEmoji,
} from './constants';
import { useStyles } from './style';
import type { EmojiObject, EmojiSelectorProps } from './type';

// Main component
const EmojiSelector = memo<EmojiSelectorProps>(
  ({
    category: initialCategory = Categories.activities,
    columns: userColumns,
    defaultValue = '',
    emojiSize = 48,
    onChange,
    placeholder = 'Search...',
    shouldInclude,
    showSearchBar,
    showTabs = true,
    value,
    ...rest
  }) => {
    const [emojiSelected, onEmojiSelected] = useMergeState(defaultValue, {
      defaultValue,
      onChange,
      value,
    });
    const { styles } = useStyles();
    const { width: windowWidth } = useWindowDimensions();

    // State
    const [activeCategory, setActiveCategory] = useState(
      categoryKeys.find((key) => Categories[key as keyof typeof Categories] === initialCategory) ||
        'activities',
    );
    const [emojiList, setEmojiList] = useState<Record<string, EmojiObject[]> | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [width, setWidth] = useState(0);

    // Calculate columns based on screen width or user preference
    const columns = useMemo(() => {
      if (userColumns) return userColumns;
      // Auto calculate: screen width / emoji size, with padding consideration
      const horizontalPadding = 32; // 左右各 16
      const availableWidth = (width || windowWidth) - horizontalPadding;
      const calculatedColumns = Math.floor(availableWidth / emojiSize);
      return Math.max(6, Math.min(calculatedColumns, 12)); // 限制在 6-12 之间
    }, [userColumns, width, windowWidth, emojiSize]);

    // Calculate actual cell size to fill the container evenly
    const cellSize = useMemo(() => {
      const horizontalPadding = 32; // 左右各 16
      const availableWidth = (width || windowWidth) - horizontalPadding;
      // Use precise division to ensure cells fill the entire width
      return availableWidth / columns;
    }, [width, windowWidth, columns]);

    // Prerender emojis
    const prerenderEmojis = useCallback(
      (callback: () => void) => {
        const list: Record<string, EmojiObject[]> = {};
        categoryKeys.forEach((c) => {
          const name = Categories[c as keyof typeof Categories].name;
          list[name] = sortEmoji(emojiByCategory(name));
        });
        setEmojiList(list);
        callback();
      },
      [columns, width],
    );

    // Handle layout
    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { width: layoutWidth } = event.nativeEvent.layout;
        setWidth(layoutWidth);
        prerenderEmojis(() => {
          setIsReady(true);
        });
      },
      [prerenderEmojis],
    );

    // Handle category change
    const handleCategoryChange = useCallback((categoryKey: string | number) => {
      setActiveCategory(categoryKey as string);
      setSearchQuery('');
    }, []);

    // Handle emoji select
    const handleEmojiSelect = useCallback(
      (emoji: EmojiObject) => {
        onEmojiSelected(charFromEmojiObject(emoji));
      },
      [onEmojiSelected],
    );

    // Get emoji data for a specific category
    const getEmojiData = useCallback(
      (categoryKey: string) => {
        if (!emojiList) return [];

        let list: EmojiObject[];

        if (searchQuery !== '') {
          // 搜索模式：搜索所有分类
          const filtered = emoji.filter((e: any) => {
            return e.short_names.some((n: string) => n.includes(searchQuery.toLowerCase()));
          });
          list = sortEmoji(filtered);
        } else {
          // 特定分类
          const name = Categories[categoryKey as keyof typeof Categories].name;
          list = emojiList[name];
        }

        const emojiData = list.map((e) => ({ emoji: e, key: e.unified }));
        return shouldInclude ? emojiData.filter((e) => shouldInclude(e.emoji)) : emojiData;
      },
      [emojiList, searchQuery, shouldInclude],
    );

    // Segmented options
    const segmentedOptions = useMemo(
      () =>
        categoryKeys.map((c) => ({
          label: Categories[c as keyof typeof Categories].symbol || '',
          value: c,
        })),
      [],
    );

    // Render emoji cell
    const renderEmojiCell = useCallback(
      ({ item }: { item: { emoji: EmojiObject; key: string } }) => (
        <EmojiCell
          active={charFromEmojiObject(item.emoji) === emojiSelected}
          colSize={cellSize}
          emoji={item.emoji}
          onPress={() => handleEmojiSelect(item.emoji)}
        />
      ),
      [cellSize, handleEmojiSelect, emojiSelected],
    );

    // Current emoji data
    const currentEmojiData = useMemo(() => {
      return getEmojiData(activeCategory);
    }, [activeCategory, getEmojiData]);

    // Render
    return (
      <Flexbox flex={1} style={styles.frame} {...rest} onLayout={handleLayout}>
        {/* 搜索栏 */}
        {showSearchBar && (
          <Flexbox paddingBlock={8} paddingInline={16}>
            <Input.Search
              clearButtonMode="always"
              onChangeText={setSearchQuery}
              placeholder={placeholder}
              returnKeyType="search"
              value={searchQuery}
            />
          </Flexbox>
        )}

        {/* 分类选择器 */}
        {showTabs && !searchQuery && (
          <Flexbox paddingBlock={8} paddingInline={16}>
            <Segmented
              block
              onChange={handleCategoryChange}
              options={segmentedOptions}
              shape={'round'}
              size="small"
              value={activeCategory}
            />
          </Flexbox>
        )}

        {/* 内容区域 */}
        {isReady ? (
          <FlatList
            contentContainerStyle={{ paddingBottom: 16, paddingInline: 16 }}
            data={currentEmojiData}
            key={`${activeCategory}-${columns}`}
            keyboardShouldPersistTaps="always"
            numColumns={columns}
            removeClippedSubviews
            renderItem={renderEmojiCell}
            showsVerticalScrollIndicator={false}
            style={styles.scrollview}
          />
        ) : (
          <Center flex={1} style={styles.loader}>
            <ActivityIndicator size="large" />
          </Center>
        )}
      </Flexbox>
    );
  },
);

EmojiSelector.displayName = 'EmojiSelector';

export default EmojiSelector;
