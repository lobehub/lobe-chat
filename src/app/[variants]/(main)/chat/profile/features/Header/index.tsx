import { memo } from 'react';

import WideScreenButton from '@/app/[variants]/(main)/chat/features/WideScreenButton';
import NavHeader from '@/features/NavHeader';

import SmartAgentActionButton from '../../Settings/features/AgentPublishButton';
import AutoSaveHint from '../ProfileEditor/AutoSaveHint';

const Header = memo(() => {
  return (
    <NavHeader
      left={<AutoSaveHint />}
      right={
        <>
          <WideScreenButton />
          <SmartAgentActionButton />
        </>
      }
    />
  );
});

export default Header;
