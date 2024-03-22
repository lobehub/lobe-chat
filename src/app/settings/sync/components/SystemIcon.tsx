import { SiApple } from '@icons-pack/react-simple-icons';
import { memo } from 'react';

const SystemIcon = memo<{ title?: string }>(({ title }) => {
  if (!title) return;

  if (['Mac OS', 'iOS'].includes(title)) {
    // TODO: 等 simple icons 修复类型，移除 ignore
    // @ts-ignore
    return <SiApple size={32} />;
  }

  return null;
});

export default SystemIcon;
