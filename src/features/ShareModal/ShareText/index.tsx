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
import { generateMarkdown } from './template';
import { FieldType } from './type';

const DEFAULT_FIELD_VALUE: FieldType = {
  includeTool: true,
  includeUser: true,
  withRole: true,
  withSystemRole: false,
};

const ShareText = memo(() => {
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
      label: t('shareModal.withRole'),
      minWidth: undefined,
      name: 'withRole',
      valuePropName: 'checked',
    },
    {
      children: <Switch />,
      label: t('shareModal.includeUser'),
      minWidth: undefined,
      name: 'includeUser',
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

  const [systemRole] = useAgentStore((s) => [agentSelectors.currentAgentSystemRole(s)]);
  const messages = useChatStore(chatSelectors.activeBaseChats, isEqual);
  const topic = useChatStore(topicSelectors.currentActiveTopic, isEqual);

  const title = topic?.title || t('shareModal.exportTitle');
  const content = generateMarkdown({
    ...fieldValue,
    messages,
    systemRole,
    title,
  }).replaceAll('\n\n\n', '\n');

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
              exportFile(content, `${title}.md`);
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

export default ShareText;
