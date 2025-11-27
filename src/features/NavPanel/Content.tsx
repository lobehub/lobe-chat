import { memo } from 'react';

import Body from './Body';
import Footer from './Footer';
import Header from './Header';
import SideBarLayout from './SideBarLayout';

const Content = memo(() => {
  return <SideBarLayout body={<Body />} footer={<Footer />} header={<Header />} />;
});

export default Content;
