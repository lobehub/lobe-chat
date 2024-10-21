import { ActionIcon, Icon } from '@lobehub/ui';
import { Button, Empty, Skeleton } from 'antd';
import { uniq } from 'lodash-es';
import { Edit2Icon, XIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { BuiltinRenderProps } from '@/types/tool';
import { SearchContent, SearchQuery, SearchResponse } from '@/types/tool/search';

import SearchBar from '../components/SearchBar';
import SearchResultItem from './SearchResultItem';
import SearchView from './SearchView';
import ShowMore from './ShowMore';

const ITEM_HEIGHT = 80;
const ITEM_WIDTH = 160;

const WebBrowsing = memo<BuiltinRenderProps<SearchContent[], SearchQuery, SearchResponse>>(
  ({ messageId, args, pluginState }) => {
    const loading = useChatStore(chatToolSelectors.isSearXNGSearching(messageId));
    const searchResults = pluginState?.results || [];
    const [editing, setEditing] = useState(false);
    const { t } = useTranslation(['tool', 'common']);

    const engines = uniq(searchResults.map((result) => result.engine));
    const defaultEngines = engines.length > 0 ? engines : args.searchEngines || [];
    const isMobile = useIsMobile();
    return (
      <Flexbox gap={16}>
        {!pluginState ? (
          <Flexbox align={'center'} distribution={'space-between'} height={32} horizontal>
            <Skeleton.Button active style={{ borderRadius: 8, height: 32, width: 180 }} />
            <Skeleton.Button active style={{ borderRadius: 8, height: 32, width: 220 }} />
          </Flexbox>
        ) : editing ? (
          <SearchBar
            defaultEngines={defaultEngines}
            defaultQuery={args?.query}
            messageId={messageId}
            onSearch={() => setEditing(false)}
            searchAddon={
              <ActionIcon
                icon={XIcon}
                onClick={() => setEditing(false)}
                title={t('cancel', { ns: 'common' })}
              />
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
        )}
        {loading || !pluginState ? (
          <Flexbox gap={12} horizontal>
            {['1', '2', '3', '4'].map((id) => (
              <Skeleton.Button
                active
                key={id}
                style={{ borderRadius: 8, height: ITEM_HEIGHT, width: ITEM_WIDTH }}
              />
            ))}
          </Flexbox>
        ) : searchResults.length === 0 ? (
          <Center>
            <Empty
              description={
                <Flexbox gap={8}>
                  <div>{t('search.emptyResult')}</div>
                  {!editing && (
                    <div>
                      <Button
                        icon={<Icon icon={Edit2Icon} />}
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
        ) : (
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
        )}
      </Flexbox>
    );
  },
);

export default WebBrowsing;
