import Client from './(loading)/Client';
import Redirect from './(loading)/Redirect';

const Page = () => {
  return (
    <>
      <Client />
      <Redirect />
    </>
  );
};

Page.displayName = 'Loading';

export default Page;
