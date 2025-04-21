import { LocalSearchFilesParams } from '@lobechat/electron-client-ipc';
import { ActionIcon, Icon } from '@lobehub/ui';
import { Button, Input, Space } from 'antd';
import { SearchIcon, XIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { LocalFileSearchState } from '@/tools/local-files/type';

import SearchView from './SearchView';

interface SearchQueryViewProps {
  args: LocalSearchFilesParams;

  messageId: string;
  pluginState?: LocalFileSearchState;
}

const SearchQueryView = memo<SearchQueryViewProps>(({ messageId, args, pluginState }) => {
  const { t } = useTranslation('tool');
  const loading = useChatStore(chatToolSelectors.isSearchingLocalFiles(messageId));
  const reSearchLocalFiles = useChatStore((s) => s.reSearchLocalFiles);
  const searchResults = pluginState?.searchResults || [];

  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState(args.keywords);

  const updateAndSearch = async () => {
    const data: LocalSearchFilesParams = { keywords: query };

    await reSearchLocalFiles(messageId, data);
  };

  return editing ? (
    <Flexbox align={'center'} flex={1} gap={8} height={32} horizontal>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          autoFocus
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onPressEnter={updateAndSearch}
          placeholder={t('search.searchBar.placeholder')}
          style={{ minWidth: 400 }}
          value={query}
          variant={'filled'}
        />
        <Button
          icon={<Icon icon={SearchIcon} />}
          loading={loading}
          onClick={updateAndSearch}
          type={'primary'}
        >
          {t('search.searchBar.button')}
        </Button>
      </Space.Compact>
      <ActionIcon icon={XIcon} onClick={() => setEditing(false)} />
    </Flexbox>
  ) : (
    <SearchView
      defaultQuery={args?.keywords}
      onEditingChange={setEditing}
      resultsNumber={searchResults.length}
      searching={loading || !pluginState}
    />
  );
});

export default SearchQueryView;
