import { memo } from 'react';

import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useIsMobile } from '@/hooks/useIsMobile';

import Mobile from '../../(mobile)/Header';
import Desktop from './Desktop';

const Header = memo(() => (
  <ResponsiveLayout Desktop={Desktop} Mobile={Mobile} isMobile={useIsMobile} />
));

export default Header;
