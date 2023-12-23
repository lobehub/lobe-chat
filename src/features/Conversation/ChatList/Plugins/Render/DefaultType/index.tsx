import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import Loading from '../Loading';
import { useParseContent } from '../useParseContent';
import IFrameRender from './IFrameRender';

const SystemJsRender = dynamic(() => import('./SystemJsRender'), { ssr: false });

export interface PluginDefaultTypeProps {
  content: string;
  loading?: boolean;
  name?: string;
}

const PluginDefaultType = memo<PluginDefaultTypeProps>(({ content, name, loading }) => {
  const manifest = useToolStore(pluginSelectors.getPluginManifestById(name || ''));

  const { isJSON, data } = useParseContent(content);

  if (!isJSON) {
    return (
      loading && (
        <Flexbox gap={8}>
          <Loading />
        </Flexbox>
      )
    );
  }

  if (!manifest?.ui) return;

  const ui = manifest.ui;

  if (!ui.url) return;

  if (ui.mode === 'module')
    return (
      <Suspense fallback={<Skeleton active style={{ width: 400 }} />}>
        <SystemJsRender content={data} name={name || 'unknown'} url={ui.url} />
      </Suspense>
    );

  return (
    <IFrameRender
      content={data}
      height={ui.height}
      name={name || 'unknown'}
      url={ui.url}
      width={ui.width}
    />
  );
});

export default PluginDefaultType;
