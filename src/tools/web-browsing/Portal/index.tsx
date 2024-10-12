import { ActionIcon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { uniq } from 'lodash-es';
import { PlusSquareIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { SearchResponse } from '@/types/tool/search';

import SearchBar from '../components/SearchBar';
import ResultList from './ResultList';

interface SearchArguments {
  query: string;
  searchEngine?: string[];
}

interface InspectorUIProps<T = Record<string, any>, S = any> {
  arguments: T;
  identifier: string;
  messageId: string;
  state: S;
}

const Inspector = memo<InspectorUIProps<SearchArguments, SearchResponse>>(
  ({ arguments: args, messageId, state }) => {
    const engines = uniq((state.results || []).map((result) => result.engine));
    const defaultEngines = engines.length > 0 ? engines : args.searchEngine || [];
    const [loading, saveSearchResult] = useChatStore((s) => [
      chatToolSelectors.isSearXNGSearching(messageId)(s),
      s.saveSearXNGSearchResult,
    ]);
    const { t } = useTranslation('tool');

    return (
      <Flexbox gap={12} height={'100%'}>
        <SearchBar
          aiSummary={false}
          defaultEngines={defaultEngines}
          defaultQuery={args.query}
          messageId={messageId}
          searchAddon={
            <ActionIcon
              icon={PlusSquareIcon}
              onClick={() => {
                saveSearchResult(messageId);
              }}
              title={t('search.createNewSearch')}
            />
          }
          tooltip={false}
        />
        {loading ? (
          <Flexbox gap={16} paddingBlock={16} paddingInline={12}>
            {[1, 2, 3, 4, 6].map((id) => (
              <Skeleton
                active
                key={id}
                paragraph={{ rows: 3, width: `${(id % 4) + 5}0%` }}
                title={false}
              />
            ))}
          </Flexbox>
        ) : (
          <Flexbox height={'100%'} width={'100%'}>
            <ResultList dataSources={state.results} />
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default Inspector;
