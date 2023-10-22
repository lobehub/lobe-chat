import { memo } from 'react';

import { usePluginStore } from '@/store/plugin';

import IFrameRender from './Iframe';

export interface PluginStandaloneTypeProps {
  name?: string;
}

const PluginDefaultType = memo<PluginStandaloneTypeProps>(({ name = 'unknown' }) => {
  const manifest = usePluginStore((s) => s.pluginManifestMap[name]);

  if (!manifest?.ui) return;

  const ui = manifest.ui;

  if (!ui.url) return;

  return <IFrameRender height={ui.height} url={ui.url} width={ui.width} />;
});

export default PluginDefaultType;
