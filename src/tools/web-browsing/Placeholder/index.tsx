import { BuiltinPlaceholderProps } from '@lobechat/types';
import { Skeleton } from 'antd';
import { memo } from 'react';

import { WebBrowsingApiName } from '@/tools/web-browsing';
import { SearchQuery } from '@/types/tool/search';

import { Search } from './Search';

const Placeholder = memo<BuiltinPlaceholderProps>(({ apiName, args }) => {
  switch (apiName) {
    case WebBrowsingApiName.search: {
      const { query } = args as SearchQuery;
      return <Search query={query} />;
    }

    default: {
      return <Skeleton.Button />;
    }
  }
});

export default Placeholder;
