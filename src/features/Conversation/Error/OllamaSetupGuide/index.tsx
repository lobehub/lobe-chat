import { memo } from 'react';

import OllamaSetupGuide from '@/components/OllamaSetupGuide';
import { isDesktop } from '@/const/version';
import { ErrorActionContainer } from '@/features/Conversation/Error/style';

import OllamaDesktopSetupGuide from './Desktop';

const SetupGuide = memo<{ container?: boolean; id?: string }>(({ id, container = true }) => {
  const content = isDesktop ? <OllamaDesktopSetupGuide id={id} /> : <OllamaSetupGuide />;

  if (!container) return content;

  return <ErrorActionContainer style={{ paddingBlock: 0 }}>{content}</ErrorActionContainer>;
});

export default SetupGuide;
