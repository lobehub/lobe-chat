import { useResponsive } from 'antd-style';
import { memo, useState } from 'react';

import { ChatInputContent } from '../../../components/ChatInput';
import Mobile from '../../../components/ChatInput/Mobile';
import Desktop from './Desktop';

const ChatInput = () => {
  const [expand, setExpand] = useState<boolean>(false);

  const { mobile } = useResponsive();

  const Render = mobile ? Mobile : Desktop;

  return (
    <Render expand={expand}>
      <ChatInputContent expand={expand} onExpandChange={setExpand} />
    </Render>
  );
};

export default memo(ChatInput);
