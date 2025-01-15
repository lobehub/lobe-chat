import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const Nav = ServerLayout({ Desktop, Mobile });

Nav.displayName = 'Nav';

export default Nav;
