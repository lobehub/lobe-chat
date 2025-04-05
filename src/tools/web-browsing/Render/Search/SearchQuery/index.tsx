import { ActionIcon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { uniq } from 'lodash-es';
import { XIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { SearchQuery, SearchResponse } from '@/types/tool/search';

import SearchBar from '../../../components/SearchBar';
import SearchView from './SearchView';

interface SearchQueryViewProps {
  args: SearchQuery;
  editing: boolean;
  messageId: string;
  pluginState?: SearchResponse;
  setEditing: (editing: boolean) => void;
}

const SearchQueryView = memo<SearchQueryViewProps>(
  ({ messageId, args, pluginState, setEditing, editing }) => {
    const loading = useChatStore(chatToolSelectors.isSearXNGSearching(messageId));
    const searchResults = pluginState?.results || [];

    const { t } = useTranslation('common');

    const engines = uniq(searchResults.map((result) => result.engine));
    const defaultEngines = engines.length > 0 ? engines : args.optionalParams?.searchEngines || [];

    return !pluginState ? (
      <Flexbox align={'center'} distribution={'space-between'} height={32} horizontal>
        <Skeleton.Button active style={{ borderRadius: 4, height: 32, width: 180 }} />
        <Skeleton.Button active style={{ borderRadius: 4, height: 32, width: 220 }} />
      </Flexbox>
    ) : editing ? (
      <SearchBar
        defaultEngines={defaultEngines}
        defaultQuery={args?.query}
        messageId={messageId}
        onSearch={() => setEditing(false)}
        searchAddon={
          <ActionIcon icon={XIcon} onClick={() => setEditing(false)} title={t('cancel')} />
        }
      />
    ) : (
      <SearchView
        defaultEngines={defaultEngines}
        defaultQuery={args?.query}
        onEditingChange={setEditing}
        resultsNumber={searchResults.length}
        searching={loading}
      />
    );
  },
);

export default SearchQueryView;
