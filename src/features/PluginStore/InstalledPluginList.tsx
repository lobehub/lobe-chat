import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import AddPluginButton from './AddPluginButton';
import PluginItem from './PluginItem';

export const InstalledPluginList = memo(() => {
  const { t } = useTranslation('plugin');
  const [keywords, setKeywords] = useState<string>();
  const { mobile } = useResponsive();
  const installedPlugins = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);

  return (
    <>
      <Flexbox align={'center'} gap={16} horizontal justify={'space-between'}>
        <Flexbox flex={1}>
          <SearchBar
            allowClear
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('store.placeholder')}
            type={mobile ? 'block' : 'ghost'}
            value={keywords}
          />
        </Flexbox>
        <Flexbox gap={8} horizontal>
          <AddPluginButton />
        </Flexbox>
      </Flexbox>

      <Flexbox gap={24}>
        {installedPlugins
          .filter((item) =>
            [item.meta?.title, item.meta?.description, item.author, ...(item.meta?.tags || [])]
              .filter(Boolean)
              .join('')
              .toLowerCase()
              .includes((keywords || '')?.toLowerCase()),
          )
          .map((i) => (
            <PluginItem {...i} key={i.identifier} />
          ))}
      </Flexbox>
    </>
  );
});

export default InstalledPluginList;
