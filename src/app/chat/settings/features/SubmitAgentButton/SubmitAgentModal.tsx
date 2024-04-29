import { Alert, Modal, type ModalProps } from '@lobehub/ui';
import { Button, Divider, Input } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { kebabCase } from 'lodash-es';
import qs from 'query-string';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { AGENTS_INDEX_GITHUB_ISSUE } from '@/const/url';
import AgentInfo from '@/features/AgentInfo';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

const SubmitAgentModal = memo<ModalProps>(({ open, onCancel }) => {
  const { t } = useTranslation('setting');
  const [identifier, setIdentifier] = useState('');
  const systemRole = useAgentStore(agentSelectors.currentAgentSystemRole);
  const theme = useTheme();
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
  const language = useUserStore((s) => settingsSelectors.currentSettings(s).language);

  const isMetaPass = Boolean(
    meta && meta.title && meta.description && (meta.tags as string[])?.length > 0 && meta.avatar,
  );

  const handleSubmit = () => {
    const body = [
      '### systemRole',
      systemRole,
      '### identifier',
      kebabCase(identifier),
      '### avatar',
      meta.avatar,
      '### title',
      meta.title,
      '### description',
      meta.description,
      '### tags',
      (meta.tags as string[]).join(', '),
      '### locale',
      language === 'auto' ? navigator.language : language,
    ].join('\n\n');

    const url = qs.stringifyUrl({
      query: { body, labels: '🤖 Agent PR', title: `[Agent] ${meta.title}` },
      url: AGENTS_INDEX_GITHUB_ISSUE,
    });

    window.open(url, '_blank');
  };

  return (
    <Modal
      allowFullscreen
      footer={
        <Button
          block
          disabled={!isMetaPass || !identifier}
          onClick={handleSubmit}
          size={'large'}
          type={'primary'}
        >
          {t('submitAgentModal.button')}
        </Button>
      }
      onCancel={onCancel}
      open={open}
      title={t('submitAgentModal.tooltips')}
    >
      <Flexbox gap={16}>
        {!isMetaPass && (
          <Alert message={t('submitAgentModal.metaMiss')} showIcon type={'warning'} />
        )}
        <AgentInfo meta={meta} systemRole={systemRole} />
        <Divider style={{ margin: '8px 0' }} />
        <strong>
          <span style={{ color: theme.colorError, marginRight: 4 }}>*</span>
          {t('submitAgentModal.identifier')}
        </strong>
        <Input
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t('submitAgentModal.placeholder')}
          value={identifier}
        />
      </Flexbox>
    </Modal>
  );
});

export default SubmitAgentModal;
