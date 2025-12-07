import { memo } from 'react';

import NavHeader from '@/features/NavHeader';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';

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
