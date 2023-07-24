import { ChatInputArea, DraggablePanel, Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { Archive } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { CHAT_TEXTAREA_HEIGHT, HEADER_HEIGHT } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import InputActions from './Action';
import Token from './Token';

const ChatInput = () => {
  const { t } = useTranslation('common');
  const [expand, setExpand] = useState<boolean>(false);
  const [text, setText] = useState('');

  const [inputHeight] = useSettings((s) => [s.inputHeight], shallow);
  const [sendMessage] = useSessionStore((s) => [s.createOrSendMsg], shallow);

  const footer = useMemo(
    () => (
      <Tooltip title={t('archiveCurrentMessages')}>
        <Button icon={<Icon icon={Archive} />} />
      </Tooltip>
    ),
    [],
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
            <InputActions />
            <Token input={text} />
          </>
        }
        expand={expand}
        footer={footer}
        minHeight={CHAT_TEXTAREA_HEIGHT}
        onExpandChange={setExpand}
        onInputChange={setText}
        onSend={sendMessage}
        placeholder={t('sendPlaceholder')}
        text={{
          send: t('send'),
        }}
      />
    </DraggablePanel>
  );
};

export default memo(ChatInput);
