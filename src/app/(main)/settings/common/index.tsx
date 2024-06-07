import Common from './features/Common';
import Theme from './features/Theme';

const Page = () => {
  return (
    <>
      <Theme />
      <Common />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
