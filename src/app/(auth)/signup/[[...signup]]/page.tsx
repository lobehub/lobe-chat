import { SignUp } from '@clerk/nextjs';

import PageTitle from './PageTitle';

const Page = () => {
  return (
    <>
      <PageTitle />
      <SignUp path="/signup" />
    </>
  );
};

export default Page;
