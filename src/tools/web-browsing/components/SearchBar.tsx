import { Icon, Tooltip } from '@lobehub/ui';
import { Button, Checkbox, Input, Select, Space, Typography } from 'antd';
import { SearchIcon } from 'lucide-react';
import { ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { SearchQuery } from '@/types/tool/search';

import { ENGINE_ICON_MAP } from '../const';
import { EngineAvatar } from './EngineAvatar';

interface SearchBarProps {
  aiSummary?: boolean;
  defaultEngines?: string[];
  defaultQuery: string;
  messageId: string;
  onSearch?: (searchQuery: SearchQuery) => void;
  searchAddon?: ReactNode;
  tooltip?: boolean;
}

const SearchBar = memo<SearchBarProps>(
  ({
    defaultEngines = [],
    aiSummary = true,
    defaultQuery,
    tooltip = true,
    searchAddon,
    onSearch,
    messageId,
  }) => {
    const { t } = useTranslation('tool');
    const loading = useChatStore(chatToolSelectors.isSearXNGSearching(messageId));
    const [query, setQuery] = useState(defaultQuery);
    const [engines, setEngines] = useState(defaultEngines);
    const isMobile = useIsMobile();
    const [reSearchWithSearXNG] = useChatStore((s) => [s.reSearchWithSearXNG]);

    const updateAndSearch = async () => {
      const data: SearchQuery = { query, searchEngines: engines };
      onSearch?.(data);
      await reSearchWithSearXNG(messageId, data, { aiSummary });
    };

    const searchButton = (
      <Button
        icon={<Icon icon={SearchIcon} />}
        loading={loading}
        onClick={updateAndSearch}
        type={'primary'}
      >
        {isMobile ? undefined : t('search.searchBar.button')}
      </Button>
    );

    return (
      <Flexbox gap={16}>
        <Flexbox align={'center'} flex={1} gap={8} height={32} horizontal>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              autoFocus
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onPressEnter={updateAndSearch}
              placeholder={t('search.searchBar.placeholder')}
              style={{ minWidth: isMobile ? undefined : 400 }}
              value={query}
              variant={'filled'}
            />
            {tooltip ? (
              <Tooltip title={t('search.searchBar.tooltip')}>{searchButton}</Tooltip>
            ) : (
              searchButton
            )}
          </Space.Compact>
          {searchAddon}
        </Flexbox>

        {isMobile ? (
          <Select
            mode={'multiple'}
            onChange={(checkedValue) => {
              setEngines(checkedValue);
            }}
            optionRender={(item) => (
              <Flexbox align={'center'} gap={8} horizontal>
                <EngineAvatar engine={item.value as string} />
                {item.value}
              </Flexbox>
            )}
            options={Object.keys(ENGINE_ICON_MAP).map((item) => ({
              label: (
                <Flexbox align={'center'} gap={8} horizontal>
                  <EngineAvatar engine={item} />
                </Flexbox>
              ),
              value: item,
            }))}
            size={'small'}
            value={engines}
            variant={'filled'}
          />
        ) : (
          <Flexbox align={'flex-start'} gap={8} horizontal>
            <Typography.Text style={{ marginTop: 2, wordBreak: 'keep-all' }} type={'secondary'}>
              {t('search.searchEngine')}
            </Typography.Text>
            <Checkbox.Group
              onChange={(checkedValue) => {
                setEngines(checkedValue);
              }}
              options={Object.keys(ENGINE_ICON_MAP).map((item) => ({
                label: (
                  <Flexbox align={'center'} gap={8} horizontal>
                    <EngineAvatar engine={item} />
                    {item}
                  </Flexbox>
                ),
                value: item,
              }))}
              value={engines}
            />
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);
export default SearchBar;
