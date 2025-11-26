import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Body from './Body';
import Footer from './Footer';
import Header from './Header';

const Content = memo(() => {
  return (
    <Flexbox style={{ height: '100%', overflow: 'hidden' }}>
      <Flexbox flex={'none'}>
        <Header />
      </Flexbox>
      <Flexbox flex={1} style={{ height: '100%', overflow: 'hidden' }}>
        <Body />
      </Flexbox>
      <Flexbox flex={'none'}>
        <Footer />
      </Flexbox>
    </Flexbox>
  );
});

export default Content;
