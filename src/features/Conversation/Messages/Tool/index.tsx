import { UIChatMessage } from '@lobechat/types';
import { Alert } from '@lobehub/ui';
import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { dataSelectors, useConversationStore } from '../../store';
import ToolItem from './ToolItem';

interface ToolMessageProps {
  id: string;
  index: number;
}

const Tool = memo<ToolMessageProps>(({ id, index }) => {
  const { t } = useTranslation('plugin');
  const item = useConversationStore(dataSelectors.getDbMessageById(id), isEqual) as UIChatMessage;
  const deleteToolMessage = useConversationStore((s) => s.deleteToolMessage);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteToolMessage(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flexbox gap={4} paddingBlock={12}>
      <Alert
        action={
          <Button loading={loading} onClick={handleDelete} size={'small'} type={'primary'}>
            {t('inspector.delete')}
          </Button>
        }
        message={t('inspector.orphanedToolCall')}
        type={'warning'}
        variant={'borderless'}
      />
      {item.plugin && (
        <ToolItem
          {...item.plugin}
          index={index}
          messageId={id}
          payload={item.plugin || {}}
          toolCallId={item.tool_call_id!}
        />
      )}
    </Flexbox>
  );
}, isEqual);

export default Tool;
