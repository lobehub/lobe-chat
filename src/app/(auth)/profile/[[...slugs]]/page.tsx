import { UserProfile } from '@clerk/nextjs';

import PageTitle from './PageTitle';

const Page = () => {
  return (
    <>
      <PageTitle />
      <UserProfile />
    </>
  );
};

export default Page;
