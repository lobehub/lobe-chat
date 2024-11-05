import { Form, type FormItemProps, Icon, copyToClipboard } from '@lobehub/ui';
import { App, Button, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { CopyIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors, topicSelectors } from '@/store/chat/selectors';
import { exportFile } from '@/utils/client/exportFile';

import Preview from './Preview';
import { generateMessages } from './generateMessages';
import { FieldType } from './type';

const DEFAULT_FIELD_VALUE: FieldType = {
  includeTool: true,
  withSystemRole: true,
};

const ShareImage = memo(() => {
  const [fieldValue, setFieldValue] = useState(DEFAULT_FIELD_VALUE);
  const { t } = useTranslation(['chat', 'common']);
  const { message } = App.useApp();

  const settings: FormItemProps[] = [
    {
      children: <Switch />,
      label: t('shareModal.withSystemRole'),
      minWidth: undefined,
      name: 'withSystemRole',
      valuePropName: 'checked',
    },
    {
      children: <Switch />,
      label: t('shareModal.includeTool'),
      minWidth: undefined,
      name: 'includeTool',
      valuePropName: 'checked',
    },
  ];

  const systemRole = useAgentStore(agentSelectors.currentAgentSystemRole);
  const messages = useChatStore(chatSelectors.currentChats, isEqual);
  const data = generateMessages({ ...fieldValue, messages, systemRole });
  const content = JSON.stringify(data, null, 2);

  const topic = useChatStore(topicSelectors.currentActiveTopic, isEqual);
  const title = topic?.title || t('shareModal.exportTitle');

  const isMobile = useIsMobile();
  return (
    <Flexbox gap={16} horizontal={!isMobile}>
      <Preview content={content} />
      <Flexbox gap={16}>
        <Form
          initialValues={DEFAULT_FIELD_VALUE}
          items={settings}
          itemsType={'flat'}
          onValuesChange={(_, v) => setFieldValue(v)}
          {...FORM_STYLE}
          itemMinWidth={320}
        />
        <Button
          block
          icon={<Icon icon={CopyIcon} />}
          onClick={async () => {
            await copyToClipboard(content);
            message.success(t('copySuccess', { defaultValue: 'Copy Success', ns: 'common' }));
          }}
          size={'large'}
          style={isMobile ? { bottom: 0, position: 'sticky' } : undefined}
          type={'primary'}
        >
          {t('copy', { ns: 'common' })}
        </Button>
        {!isMobile && (
          <Button
            block
            onClick={() => {
              exportFile(content, `${title}.json`);
            }}
            size={'large'}
            variant={'filled'}
          >
            {t('shareModal.downloadFile')}
          </Button>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default ShareImage;
