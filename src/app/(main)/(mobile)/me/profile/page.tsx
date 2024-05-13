import { redirect } from 'next/navigation';

import { isMobileDevice } from '@/utils/responsive';

import Category from './features/Category';

const Page = () => {
  const mobile = isMobileDevice();

  if (!mobile) return redirect('/profile');

  return <Category />;
};

Page.displayName = 'MeProfile';

export default Page;
