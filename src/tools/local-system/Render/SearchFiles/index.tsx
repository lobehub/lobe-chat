import { LocalSearchFilesParams } from '@lobechat/electron-client-ipc';
import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LocalFileSearchState } from '@/tools/local-system/type';

import SearchResult from './Result';
import SearchQuery from './SearchQuery';

const SearchFiles = memo<BuiltinRenderProps<LocalSearchFilesParams, LocalFileSearchState>>(
  ({ messageId, pluginError, args, pluginState }) => {
    return (
      <Flexbox gap={4}>
        <SearchQuery args={args} messageId={messageId} pluginState={pluginState} />
        <SearchResult
          messageId={messageId}
          pluginError={pluginError}
          searchResults={pluginState?.searchResults}
        />
      </Flexbox>
    );
  },
);

SearchFiles.displayName = 'SearchFiles';

export default SearchFiles;
