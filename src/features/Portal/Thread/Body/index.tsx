import { Flexbox } from 'react-layout-kit';

import Chat from '../Chat';

const ThreadBody = () => {
  return (
    <Flexbox flex={1}>
      <Chat />
    </Flexbox>
  );
};

export default ThreadBody;
