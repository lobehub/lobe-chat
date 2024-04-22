import {SiAndroid, SiApple, SiBlackberry, SiGooglechrome, SiLinux, SiWindows11} from '@icons-pack/react-simple-icons';
import { memo } from 'react';

// TODO: 等 simple icons 修复类型，移除 ignore

const SystemIcon = memo<{ title?: string }>(({ title }) => {
  if (!title) return;

  // @ts-ignore
  if (['Mac OS', 'iOS', 'iPadOS'].includes(title)) return <SiApple size={32} />;

  // @ts-ignore
  if (['Windows'].includes(title))return <SiWindows11 size={32} />;

  // @ts-ignore
  if (title === 'Android') return <SiAndroid size={32} />;

  // @ts-ignore
  if (['BlackBerry'].includes(title))return <SiBlackberry size={32} />;

  // @ts-ignore
  if (title === 'Linux') return <SiLinux size={32} />;

  // @ts-ignore
  if (title === 'Chrome OS') return <SiGooglechrome size={32} />;

  return null;
});

export default SystemIcon;
