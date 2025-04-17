import { Skeleton } from 'antd';
import { uniq } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { SearchQuery, UniformSearchResponse } from '@/types/tool/search';

import SearchBar from '../../components/SearchBar';
import Footer from './Footer';
import ResultList from './ResultList';

interface InspectorUIProps {
  messageId: string;
  query: SearchQuery;
  response: UniformSearchResponse;
}

const Inspector = memo<InspectorUIProps>(({ query: args, messageId, response }) => {
  const engines = uniq((response.results || []).flatMap((result) => result.engines));
  const defaultEngines = engines.length > 0 ? engines : args?.searchEngines || [];
  const loading = useChatStore(chatToolSelectors.isSearXNGSearching(messageId));

  if (loading) {
    return (
      <Flexbox gap={12} height={'100%'}>
        <SearchBar
          aiSummary={false}
          defaultEngines={defaultEngines}
          defaultQuery={args.query}
          messageId={messageId}
          tooltip={false}
        />

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
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={0} height={'100%'}>
      <Flexbox gap={12} height={'100%'}>
        <SearchBar
          aiSummary={false}
          defaultEngines={defaultEngines}
          defaultQuery={args.query}
          messageId={messageId}
          tooltip={false}
        />
        <Flexbox height={'100%'} width={'100%'}>
          <ResultList dataSources={response.results} />
        </Flexbox>
      </Flexbox>
      <Footer />
    </Flexbox>
  );
});

export default Inspector;
