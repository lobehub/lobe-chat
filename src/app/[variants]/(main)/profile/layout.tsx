import ServerLayout from '@/components/server/ServerLayout';
import { withSuspense } from '@/components/withSuspense';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const ProfileLayout = ServerLayout<LayoutProps>({ Desktop, Mobile });

ProfileLayout.displayName = 'ProfileLayout';

export default withSuspense(ProfileLayout);
