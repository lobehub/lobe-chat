import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { messageStateSelectors } from '@/store/chat/selectors';
import { UIChatMessage } from '@/types/index';

import { UserActionsBar } from './ActionsBar';
import MessageBranch from './MessageBranch';

interface ActionsProps {
  data: UIChatMessage;
  disableEditing?: boolean;
  id: string;
  index: number;
}

const Actions = memo<ActionsProps>(({ id, data, index, disableEditing }) => {
  const { branch } = data;
  const [editing] = useChatStore((s) => [messageStateSelectors.isMessageEditing(id)(s)]);

  return (
    !editing && (
      <Flexbox align={'center'} horizontal>
        {!disableEditing && (
          <Flexbox align={'flex-start'} role="menubar">
            <UserActionsBar data={data} id={id} index={index} />
          </Flexbox>
        )}
        {branch && (
          <MessageBranch
            activeBranchIndex={branch.activeBranchIndex}
            count={branch.count}
            messageId={id}
          />
        )}
      </Flexbox>
    )
  );
});

export default Actions;
