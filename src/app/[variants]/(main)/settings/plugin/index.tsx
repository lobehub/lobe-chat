'use client';

import { DraggablePanel } from '@lobehub/ui';
import { Empty, Input } from 'antd';
import { useTheme } from 'antd-style';
import { Search } from 'lucide-react';
import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { LobeToolType } from '@/types/tool/tool';

import Detail from './components/Detail';
import List from './components/List';

const PluginSettings = memo(() => {
  const { t } = useTranslation('plugin');
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const [keywords, setKeywords] = useState<string>('');
  const [type, setType] = useState<LobeToolType>();
  const [runtimeType, setRuntimeType] = useState<'mcp' | 'default'>();

  const [identifier] = useToolStore((s) => [s.activePluginIdentifier]);
  const isEmpty = useToolStore((s) => pluginSelectors.installedPluginMetaList(s).length === 0);
  useFetchInstalledPlugins();

  if (isEmpty)
    return (
      <Center height={'60vh'} paddingBlock={40}>
        <Empty description={t('store.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <Flexbox
      height={'100vh'}
      horizontal
      style={{
        overflow: 'hidden',
        position: 'relative',
      }}
      width={'100%'}
    >
      <DraggablePanel maxWidth={1024} minWidth={420} placement={'left'}>
        <Flexbox padding={8}>
          <Input
            allowClear
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('store.search')}
            prefix={<Search size={16} />}
            style={{ width: '100%' }}
            value={keywords}
          />
        </Flexbox>

        <List
          identifier={identifier}
          keywords={keywords}
          setIdentifier={({ identifier, type, runtimeType }) => {
            useToolStore.setState({ activePluginIdentifier: identifier });
            setType(type);
            setRuntimeType(runtimeType);
            ref?.current?.scrollTo({ top: 0 });
          }}
        />
      </DraggablePanel>
      {identifier ? (
        <Flexbox
          height={'100%'}
          padding={16}
          ref={ref}
          style={{
            background: theme.colorBgContainerSecondary,
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
          width={'100%'}
        >
          <Detail identifier={identifier} runtimeType={runtimeType} type={type} />
        </Flexbox>
      ) : (
        <Center
          height={'100%'}
          style={{
            background: theme.colorBgContainerSecondary,
          }}
          width={'100%'}
        >
          <Empty description={t('store.emptySelectHint')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Center>
      )}
    </Flexbox>
  );
});

export default PluginSettings;
