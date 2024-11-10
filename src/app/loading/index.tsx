import Client from './Client';
import Redirect from './Redirect';

const ScreenLoading = () => {
  return (
    <>
      <Client />
      <Redirect />
    </>
  );
};

ScreenLoading.displayName = 'ScreenLoading';

export default ScreenLoading;
