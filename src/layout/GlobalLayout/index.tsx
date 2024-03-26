import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './Desktop';
import Mobile from './Mobile';

const GlobalLayout = ServerLayout({ Desktop, Mobile });

export default GlobalLayout;
