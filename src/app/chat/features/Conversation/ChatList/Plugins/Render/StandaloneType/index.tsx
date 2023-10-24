import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { memo } from 'react';

import { usePluginStore } from '@/store/plugin';

import IFrameRender from './Iframe';

export interface PluginStandaloneTypeProps {
  id: string;
  name?: string;
  payload?: PluginRequestPayload;
}

const PluginDefaultType = memo<PluginStandaloneTypeProps>(({ payload, id, name = 'unknown' }) => {
  const manifest = usePluginStore((s) => s.pluginManifestMap[name]);

  if (!manifest?.ui) return;

  const ui = manifest.ui;

  if (!ui.url) return;

  return (
    <IFrameRender height={ui.height} id={id} payload={payload} url={ui.url} width={ui.width} />
  );
});

export default PluginDefaultType;
