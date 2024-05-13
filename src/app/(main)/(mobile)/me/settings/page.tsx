import { redirect } from 'next/navigation';

import { isMobileDevice } from '@/utils/responsive';

import Category from './features/Category';

const Page = () => {
  const mobile = isMobileDevice();

  if (!mobile) return redirect('/settings/common');

  return <Category />;
};

Page.displayName = 'MeSettings';

export default Page;
