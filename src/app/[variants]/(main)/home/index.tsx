import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import WideScreenButton from '@/app/[variants]/(main)/chat/features/WideScreenButton';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import NavHeader from '@/features/NavHeader';

import HomeContent from './features';

const Home = memo(() => {
  return (
    <>
      <NavHeader right={<WideScreenButton />} />
      <Flexbox height={'100%'} style={{ overflowY: 'auto', position: 'relative' }} width={'100%'}>
        <WideScreenContainer>
          <HomeContent />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
});

Home.displayName = 'Home';

export default Home;
