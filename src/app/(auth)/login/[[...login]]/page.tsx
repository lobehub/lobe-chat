import { SignIn } from '@clerk/nextjs';

import PageTitle from './PageTitle';

const Page = () => {
  return (
    <>
      <PageTitle />
      <SignIn path="/login" />
    </>
  );
};

export default Page;
