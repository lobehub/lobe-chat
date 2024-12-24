import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BuiltinRenderProps } from '@/types/tool';
import { SearchContent, SearchQuery, SearchResponse } from '@/types/tool/search';

import SearchQueryView from './SearchQuery';
import SearchResult from './SearchResult';

const WebBrowsing = memo<BuiltinRenderProps<SearchContent[], SearchQuery, SearchResponse>>(
  ({ messageId, args, pluginState }) => {
    const [editing, setEditing] = useState(false);

    return (
      <Flexbox gap={16}>
        <SearchQueryView
          args={args}
          editing={editing}
          messageId={messageId}
          pluginState={pluginState}
          setEditing={setEditing}
        />
        <SearchResult
          args={args}
          editing={editing}
          messageId={messageId}
          pluginState={pluginState}
          setEditing={setEditing}
        />
      </Flexbox>
    );
  },
);

export default WebBrowsing;
