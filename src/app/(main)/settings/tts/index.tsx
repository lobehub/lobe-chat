import OpenAI from './features/OpenAI';
import STT from './features/STT';

const Page = () => {
  return (
    <>
      <STT />
      <OpenAI />
    </>
  );
};

Page.displayName = 'TtsSetting';

export default Page;
