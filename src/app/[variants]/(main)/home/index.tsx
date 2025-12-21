import { FC } from 'react';
import { Flexbox } from 'react-layout-kit';

import PageTitle from '@/components/PageTitle';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';

import HomeContent from './features';

const Home: FC = () => {
  return (
    <>
      <PageTitle title="" />
      <NavHeader right={<WideScreenButton />} />
      <Flexbox height={'100%'} style={{ overflowY: 'auto', paddingBottom: '16vh' }} width={'100%'}>
        <WideScreenContainer>
          <HomeContent />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
};

Home.displayName = 'Home';

export default Home;
