import { Alert, Highlighter } from '@lobehub/ui';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BuiltinRenderProps } from '@/types/tool';
import { SearchContent, SearchQuery, SearchResponse } from '@/types/tool/search';

import ConfigForm from './ConfigForm';
import SearchQueryView from './SearchQuery';
import SearchResult from './SearchResult';

const WebBrowsing = memo<BuiltinRenderProps<SearchContent[], SearchQuery, SearchResponse>>(
  ({ messageId, args, pluginState, pluginError }) => {
    const [editing, setEditing] = useState(false);

    if (pluginError) {
      if (pluginError?.type === 'PluginSettingsInvalid') {
        return <ConfigForm id={messageId} provider={pluginError.body?.provider} />;
      }

      return (
        <Alert
          extra={
            <Flexbox>
              <Highlighter copyButtonSize={'small'} language={'json'} type={'pure'}>
                {JSON.stringify(pluginError.body?.data || pluginError.body, null, 2)}
              </Highlighter>
            </Flexbox>
          }
          message={pluginError?.message}
          type={'error'}
        />
      );
    }

    return (
      <Flexbox gap={8}>
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
