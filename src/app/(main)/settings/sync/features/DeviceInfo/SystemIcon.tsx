import {
  SiAndroid,
  SiApple,
  SiBlackberry,
  SiGooglechrome,
  SiLinux,
  SiWindows11,
} from '@icons-pack/react-simple-icons';
import { memo } from 'react';

const SystemIcon = memo<{ title?: string }>(({ title }) => {
  if (!title) return;

  if (['Mac OS', 'iOS', 'iPadOS'].includes(title)) return <SiApple size={24} />;

  // Remove Microsoft brands in @icons-pack/react-simple-icons v10
  // https://github.com/simple-icons/simple-icons/pull/10019
  if (['Windows'].includes(title)) return <SiWindows11 size={24} />;

  if (title === 'Android') return <SiAndroid size={24} />;

  if (['BlackBerry'].includes(title)) return <SiBlackberry size={24} />;

  if (title === 'Linux') return <SiLinux size={24} />;

  if (title === 'Chrome OS') return <SiGooglechrome size={24} />;

  return null;
});

export default SystemIcon;
