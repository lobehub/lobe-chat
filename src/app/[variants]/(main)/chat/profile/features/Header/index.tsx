import { ActionIcon } from '@lobehub/ui';
import { SparklesIcon } from 'lucide-react';
import { memo } from 'react';

import WideScreenButton from '@/app/[variants]/(main)/chat/features/WideScreenButton';
import NavHeader from '@/features/NavHeader';

import AgentPublishButton from './AgentPublishButton';
import AutoSaveHint from './AutoSaveHint';

interface HeaderProps {
  onToggleAgentBuilder?: () => void;
}

const Header = memo<HeaderProps>(({ onToggleAgentBuilder }) => {
  return (
    <NavHeader
      left={<AutoSaveHint />}
      right={
        <>
          <ActionIcon
            aria-label="Agent Builder"
            icon={SparklesIcon}
            onClick={onToggleAgentBuilder}
            size={15.5}
            title="Agent Builder"
          />
          <WideScreenButton />
          <AgentPublishButton />
        </>
      }
    />
  );
});

export default Header;
