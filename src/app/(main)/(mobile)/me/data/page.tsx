import { redirect } from 'next/navigation';

import { isMobileDevice } from '@/utils/responsive';

import Category from './features/Category';

const Page = () => {
  const mobile = isMobileDevice();

  if (!mobile) return redirect('/chat');

  return <Category />;
};

Page.displayName = 'MeData';

export default Page;
