import { Flexbox, Text, useTheme } from '@lobehub/ui-rn';
import { SearchIcon } from 'lucide-react-native';
import { memo } from 'react';

export interface SearchQueryProps {
  query?: string;
}

/**
 * SearchQuery - 搜索查询展示
 * 简化版，只展示查询内容，不支持编辑
 */
const SearchQuery = memo<SearchQueryProps>(({ query }) => {
  const theme = useTheme();

  if (!query) return null;

  return (
    <Flexbox align="center" gap={8} horizontal paddingBlock={4}>
      <SearchIcon color={theme.colorTextSecondary} size={12} />
      <Text
        color={theme.colorTextSecondary}
        ellipsis
        fontSize={12}
        style={{
          maxWidth: '75%',
        }}
      >
        {query}
      </Text>
    </Flexbox>
  );
});

SearchQuery.displayName = 'SearchQuery';

export default SearchQuery;
