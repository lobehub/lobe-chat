import { SiOpenai } from '@icons-pack/react-simple-icons';
import {
  ActionIconGroup,
  RenderAction,
  RenderMessage,
  RenderMessageExtra,
  Tag,
  useChatListActionsBar,
} from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';
import { chatSelectors } from '@/store/session/slices/chat/selectors';
import { isFunctionMessage } from '@/utils/message';

import FunctionCall from '../Plugins/FunctionCall';
import { DefautMessage } from './Default';

const useStyles = createStyles(({ css }) => ({
  container: css`
    margin-top: 8px;
  `,
  plugin: css`
    display: flex;
    gap: 4px;
    align-items: center;
    width: fit-content;
  `,
}));

export const AssistantMessage: RenderMessage = memo(
  ({ id, plugin, function_call, content, ...props }) => {
    const genFunctionCallProps = useSessionStore(chatSelectors.currentFunctionCallProps);

    if (!isFunctionMessage(content)) return <DefautMessage content={content} id={id} {...props} />;

    const fcProps = genFunctionCallProps({ content, function_call, id, plugin });

    return (
      <div id={id}>
        <FunctionCall {...fcProps} />
      </div>
    );
  },
);

export const AssistantMessageExtra: RenderMessageExtra = memo(({ extra, function_call }) => {
  const { styles } = useStyles();
  const model = useSessionStore(agentSelectors.currentAgentModel);

  const hasModelTag = extra?.fromModel && model !== extra?.fromModel;
  const hasFuncTag = !!function_call;
  if (!(hasModelTag || hasFuncTag)) return;

  return (
    <Flexbox className={styles.container} horizontal>
      <div>
        <Tag icon={<SiOpenai size={'1em'} />}>{extra?.fromModel as string}</Tag>
      </div>
    </Flexbox>
  );
});

export const AssistantActionsBar: RenderAction = memo(({ text, error, id, onActionClick }) => {
  const { regenerate, edit, copy, divider, del } = useChatListActionsBar(text);
  if (id === 'default') return;
  return (
    <ActionIconGroup
      dropdownMenu={error ? [regenerate, divider, del] : [edit, copy, regenerate, divider, del]}
      items={[regenerate]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
