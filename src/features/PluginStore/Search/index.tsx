import { SearchBar } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';

export const Search = memo(() => {
  const { t } = useTranslation('plugin');
  const [keywords] = useToolStore((s) => [s.mcpSearchKeywords]);

  return (
    <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
      <Flexbox flex={1}>
        <SearchBar
          allowClear
          defaultValue={keywords}
          onSearch={(keywords: string) => {
            useToolStore.setState({ mcpSearchKeywords: keywords, searchLoading: true });
          }}
          placeholder={t('store.placeholder')}
          variant={'borderless'}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default Search;
