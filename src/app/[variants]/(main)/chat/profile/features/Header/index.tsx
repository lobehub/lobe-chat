import { memo } from 'react';

import WideScreenButton from '@/app/[variants]/(main)/chat/features/WideScreenButton';
import NavHeader from '@/features/NavHeader';

import AgentBuilderToggle from './AgentBuilderToggle';
import AgentPublishButton from './AgentPublishButton';
import AutoSaveHint from './AutoSaveHint';

const Header = memo(() => {
  return (
    <NavHeader
      left={<AutoSaveHint />}
      right={
        <>
          <WideScreenButton />
          <AgentBuilderToggle />
          <AgentPublishButton />
        </>
      }
    />
  );
});

export default Header;
