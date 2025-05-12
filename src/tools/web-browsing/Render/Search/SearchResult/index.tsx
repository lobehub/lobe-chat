import { Button } from '@lobehub/ui';
import { Empty, Skeleton } from 'antd';
import { uniq } from 'lodash-es';
import { Edit2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { SearchQuery, UniformSearchResponse } from '@/types/tool/search';

import SearchResultItem from './SearchResultItem';
import ShowMore from './ShowMore';

const ITEM_HEIGHT = 80;
const ITEM_WIDTH = 160;

interface SearchResultProps {
  args: SearchQuery;
  editing: boolean;
  messageId: string;
  pluginState?: UniformSearchResponse;
  setEditing: (editing: boolean) => void;
}

const SearchResult = memo<SearchResultProps>(
  ({ messageId, args, pluginState, setEditing, editing }) => {
    const loading = useChatStore(chatToolSelectors.isSearXNGSearching(messageId));
    const searchResults = pluginState?.results || [];
    const { t } = useTranslation(['tool', 'common']);

    const engines = uniq(searchResults.flatMap((result) => result.engines));
    const defaultEngines = engines.length > 0 ? engines : args?.searchEngines || [];
    const isMobile = useIsMobile();

    if (loading || !pluginState)
      return (
        <Flexbox gap={12} horizontal>
          {['1', '2', '3', '4', '5'].map((id) => (
            <Skeleton.Button
              active
              key={id}
              style={{ borderRadius: 8, height: ITEM_HEIGHT, width: ITEM_WIDTH }}
            />
          ))}
        </Flexbox>
      );

    if (searchResults.length === 0)
      return (
        <Center>
          <Empty
            description={
              <Flexbox gap={8}>
                <div>{t('search.emptyResult')}</div>
                {!editing && (
                  <div>
                    <Button
                      icon={Edit2Icon}
                      onClick={() => {
                        setEditing(true);
                      }}
                      type={'primary'}
                    >
                      {t('edit', { ns: 'common' })}
                    </Button>
                  </div>
                )}
              </Flexbox>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Center>
      );

    return (
      <Flexbox gap={8}>
        <Flexbox
          gap={12}
          horizontal
          style={{ minHeight: ITEM_HEIGHT, overflowX: 'scroll', width: '100%' }}
        >
          {searchResults.slice(0, 5).map((result) => (
            <div key={result.url} style={{ minWidth: ITEM_WIDTH, width: ITEM_WIDTH }}>
              <SearchResultItem {...result} />
            </div>
          ))}
          {!isMobile && searchResults.length > 5 && (
            <div style={{ minWidth: ITEM_WIDTH }}>
              <ShowMore
                engines={defaultEngines}
                messageId={messageId}
                resultsNumber={searchResults.length - 5}
              />
            </div>
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default SearchResult;
