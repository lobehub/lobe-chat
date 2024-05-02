import { redirect } from 'next/navigation';

import Common from './common';

const Page = () => {
  redirect('/settings/common');

  return <Common />;
};

export default Page;
