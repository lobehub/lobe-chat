import SystemAgentForm from './features/createForm';

const Page = () => {
  return (
    <>
      <SystemAgentForm systemAgentKey="topic" />
      <SystemAgentForm systemAgentKey="translation" />
      <SystemAgentForm systemAgentKey="agentMeta" />
    </>
  );
};

Page.displayName = 'SystemAgent';

export default Page;
