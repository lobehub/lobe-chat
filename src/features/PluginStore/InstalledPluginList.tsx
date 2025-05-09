import { SearchBar } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import AddPluginButton from './AddPluginButton';
import PluginItem from './PluginItem';

export const InstalledPluginList = memo(() => {
  const { t } = useTranslation('plugin');
  const [keywords, setKeywords] = useState<string>();
  const installedPlugins = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);

  const filteredPluginList = useMemo(
    () =>
      installedPlugins.filter((item) =>
        [item.meta?.title, item.meta?.description, item.author, ...(item.meta?.tags || [])]
          .filter(Boolean)
          .join('')
          .toLowerCase()
          .includes((keywords || '')?.toLowerCase()),
      ),
    [installedPlugins, keywords],
  );

  return (
    <>
      <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
        <Flexbox flex={1}>
          <SearchBar
            allowClear
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('store.placeholder')}
            style={{ flex: 1, width: '100%' }}
            value={keywords}
            variant={'filled'}
          />
        </Flexbox>
        <AddPluginButton />
      </Flexbox>
      <Virtuoso
        itemContent={(index) => {
          const item = filteredPluginList[index];
          return <PluginItem key={item.identifier} {...item} />;
        }}
        overscan={400}
        style={{ height: 500, marginInline: -16 }}
        totalCount={filteredPluginList.length}
      />
    </>
  );
});

export default InstalledPluginList;
