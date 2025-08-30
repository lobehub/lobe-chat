import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatInput } from '../hooks/useChatInput';
import ExpandButton from './ExpandButton';
import MessageFromUrl from './MessageFromUrl';
import SaveTopic from './SaveTopic';
import SendButton from './SendButton';

const SendArea = memo(() => {
  const { allowExpand } = useChatInput();
  return (
    <>
      <Suspense>
        <MessageFromUrl />
      </Suspense>
      <Flexbox align={'center'} flex={'none'} gap={6} horizontal>
        {allowExpand && <ExpandButton />}
        <SaveTopic />
        <SendButton />
      </Flexbox>
    </>
  );
});

SendArea.displayName = 'SendArea';

export default SendArea;
