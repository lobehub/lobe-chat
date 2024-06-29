import AgentMeta from './features/AgentMeta';
import Topic from './features/Topic';
import Translation from './features/Translation';

const Page = () => {
  return (
    <>
      <Topic />
      <Translation />
      <AgentMeta />
    </>
  );
};

Page.displayName = 'SystemAgent';

export default Page;
