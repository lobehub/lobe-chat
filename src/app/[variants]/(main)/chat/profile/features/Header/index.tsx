import { ActionIcon } from '@lobehub/ui';
import { BotMessageSquareIcon } from 'lucide-react';
import { memo } from 'react';

import WideScreenButton from '@/app/[variants]/(main)/chat/features/WideScreenButton';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import NavHeader from '@/features/NavHeader';

import { useProfileContext } from '../ProfileProvider';
import AgentPublishButton from './AgentPublishButton';
import AutoSaveHint from './AutoSaveHint';

const Header = memo(() => {
  const { chatPanelExpanded, setChatPanelExpanded } = useProfileContext();

  return (
    <NavHeader
      left={<AutoSaveHint />}
      right={
        <>
          <WideScreenButton />
          <ActionIcon
            active={chatPanelExpanded}
            aria-label="Agent Builder"
            icon={BotMessageSquareIcon}
            onClick={() => setChatPanelExpanded((prev) => !prev)}
            size={DESKTOP_HEADER_ICON_SIZE}
            title="Agent Builder"
          />
          <AgentPublishButton />
        </>
      }
    />
  );
});

export default Header;
