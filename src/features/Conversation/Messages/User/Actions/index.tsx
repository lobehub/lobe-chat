import { Pagination } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { messageStateSelectors } from '@/store/chat/selectors';
import { UIChatMessage } from '@/types/index';

import { UserActionsBar } from './ActionsBar';

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
    <Flexbox horizontal>
      {!disableEditing && !editing && (
        <Flexbox align={'flex-start'} role="menubar">
          <UserActionsBar data={data} id={id} index={index} />
        </Flexbox>
      )}
      {branch && (
        <Pagination
          current={branch.activeBranchIndex + 1}
          pageSize={1}
          simple
          size="small"
          total={branch.count}
        />
      )}
    </Flexbox>
  );
});

export default Actions;
