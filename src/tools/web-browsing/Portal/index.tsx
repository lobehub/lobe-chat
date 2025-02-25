import { Skeleton } from 'antd';
import { uniq } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { SearchResponse } from '@/types/tool/search';

import SearchBar from '../components/SearchBar';
import Footer from './Footer';
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
    const loading = useChatStore(chatToolSelectors.isSearXNGSearching(messageId));

    return (
      <Flexbox gap={12} height={'100%'}>
        <SearchBar
          aiSummary={false}
          defaultEngines={defaultEngines}
          defaultQuery={args.query}
          messageId={messageId}
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
          <>
            <Flexbox height={'100%'} width={'100%'}>
              <ResultList dataSources={state.results} />
            </Flexbox>
            <Footer />
          </>
        )}
      </Flexbox>
    );
  },
);

export default Inspector;
