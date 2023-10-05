import { memo } from 'react';

import { HeaderContent } from '@/app/chat/settings/components/Header';

import Layout from './Desktop';

const Header = memo(() => (
  <Layout>
    <HeaderContent />
  </Layout>
));

export default Header;
