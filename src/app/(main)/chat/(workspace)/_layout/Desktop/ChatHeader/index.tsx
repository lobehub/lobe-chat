import { ChatHeader } from '@lobehub/ui';

import HeaderAction from './HeaderAction';
import Main from './Main';

const Header = () => (
  <ChatHeader
    left={<Main />}
    right={<HeaderAction />}
    style={{ minHeight: 64, position: 'initial', zIndex: 11 }}
  />
);

export default Header;
