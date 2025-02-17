import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const SettingsLayout = ServerLayout<LayoutProps>({ Desktop, Mobile });

SettingsLayout.displayName = 'SettingsLayout';

export default SettingsLayout;
