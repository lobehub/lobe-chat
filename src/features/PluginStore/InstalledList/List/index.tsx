import { Empty } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { LobeToolType } from '@/types/tool/tool';

import PluginItem from './Item';

interface ListProps {
  identifier?: string;
  keywords?: string;
  setIdentifier?: (props: {
    identifier?: string;
    runtimeType: 'mcp' | 'default';
    type?: LobeToolType;
  }) => void;
}

export const List = memo<ListProps>(({ keywords, identifier, setIdentifier }) => {
  const { t } = useTranslation('plugin');
  const installedPlugins = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);

  const filteredPluginList = useMemo(
    () =>
      installedPlugins.filter((item) =>
        [item?.title, item?.description, item.author, ...(item?.tags || [])]
          .filter(Boolean)
          .join('')
          .toLowerCase()
          .includes((keywords || '')?.toLowerCase()),
      ),
    [installedPlugins, keywords],
  );

  const isEmpty = installedPlugins.length === 0;

  if (isEmpty)
    return (
      <Center paddingBlock={40}>
        <Empty description={t('store.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <Virtuoso
      data={filteredPluginList}
      itemContent={(_, item) => {
        return (
          <Flexbox
            key={item.identifier}
            onClick={() => {
              setIdentifier?.({
                identifier: item.identifier,
                runtimeType: item.runtimeType as any,
                type: item.type,
              });
            }}
            paddingBlock={2}
            paddingInline={4}
          >
            <PluginItem active={identifier === item.identifier} {...(item as any)} />
          </Flexbox>
        );
      }}
      overscan={400}
      style={{ height: '100%', width: '100%' }}
      totalCount={filteredPluginList.length}
    />
  );
});

export default List;
