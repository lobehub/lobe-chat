import { ActionIcon, ChatInputArea, DraggablePanel, Icon, TokenTag, Tooltip } from '@lobehub/ui';
import { Button, Popconfirm } from 'antd';
import { encode } from 'gpt-tokenizer';
import { Archive, Eraser, Languages } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { CHAT_TEXTAREA_HEIGHT, HEADER_HEIGHT } from '@/const/layoutTokens';
import { ModelTokens } from '@/const/modelTokens';
import { agentSelectors, chatSelectors, useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

const ChatInput = () => {
  const { t } = useTranslation();
  const [expand, setExpand] = useState<boolean>(false);
  const [text, setText] = useState('');
  const inputTokenCount = useMemo(() => encode(text).length, [text]);

  const [inputHeight] = useSettings((s) => [s.inputHeight], shallow);
  const [totalToken, systemRoleToken, chatsToken, model, sendMessage, clearMessage] =
    useSessionStore(
      (s) => [
        chatSelectors.totalTokenCount(s),
        chatSelectors.systemRoleTokenCount(s),
        chatSelectors.chatsTokenCount(s),
        agentSelectors.currentAgentModel(s),
        s.createOrSendMsg,
        s.clearMessage,
      ],
      shallow,
    );

  return (
    <DraggablePanel
      expandable={false}
      fullscreen={expand}
      headerHeight={HEADER_HEIGHT}
      minHeight={CHAT_TEXTAREA_HEIGHT}
      onSizeChange={(_, size) => {
        if (!size) return;
        useSettings.setState({
          inputHeight: typeof size.height === 'string' ? Number.parseInt(size.height) : size.height,
        });
      }}
      placement="bottom"
      size={{ height: inputHeight, width: '100%' }}
      style={{ zIndex: 10 }}
    >
      <ChatInputArea
        actions={
          <>
            <ActionIcon icon={Languages} />
            <Popconfirm onConfirm={() => clearMessage()} title={t('confirmClearCurrentMessages')}>
              <ActionIcon icon={Eraser} title={t('clearCurrentMessages')} />
            </Popconfirm>
            <Tooltip title={t('tokenDetail', { chatsToken, systemRoleToken })}>
              <TokenTag maxValue={ModelTokens[model]} value={totalToken + inputTokenCount} />
            </Tooltip>
          </>
        }
        expand={expand}
        footer={<Button icon={<Icon icon={Archive} title={t('archiveCurrentMessages')} />} />}
        minHeight={CHAT_TEXTAREA_HEIGHT}
        onExpandChange={setExpand}
        onInputChange={setText}
        onSend={sendMessage}
      />
    </DraggablePanel>
  );
};

export default memo(ChatInput);
