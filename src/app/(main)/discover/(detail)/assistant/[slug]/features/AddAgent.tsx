'use client';

import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { SESSION_CHAT_URL } from '@/const/url';
import { useSessionStore } from '@/store/session';
import { DiscoverAssistantItem } from '@/types/discover';

const useStyles = createStyles(({ css }) => ({
  button: css`
    button {
      width: 100%;
    }
  `,
}));

const AddAgent = memo<{ data: DiscoverAssistantItem; mobile?: boolean }>(({ data, mobile }) => {
  const { styles } = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const createSession = useSessionStore((s) => s.createSession);
  const { message } = App.useApp();
  const router = useRouter();
  const { t } = useTranslation('discover');

  const handleAddAgentAndConverse = async () => {
    if (!data) return;

    setIsLoading(true);
    const session = await createSession({ config: data.config, meta: data.meta });
    setIsLoading(false);
    message.success(t('assistants.addAgentSuccess'));
    router.push(SESSION_CHAT_URL(session, mobile));
  };

  const handleAddAgent = async () => {
    if (!data) return;
    setIsLoading(true);
    createSession({ config: data.config, meta: data.meta }, false);
    message.success(t('assistants.addAgentSuccess'));
    setIsLoading(false);
  };

  if (mobile)
    return (
      <ActionIcon
        active
        icon={PlusIcon}
        onClick={handleAddAgentAndConverse}
        size={MOBILE_HEADER_ICON_SIZE}
        title={t('assistants.addAgentAndConverse')}
      />
    );

  return (
    <Dropdown.Button
      className={styles.button}
      icon={<Icon icon={ChevronDownIcon} />}
      loading={isLoading}
      menu={{
        items: [
          {
            key: 'addAgent',
            label: t('assistants.addAgent'),
            onClick: handleAddAgent,
          },
        ],
      }}
      onClick={handleAddAgentAndConverse}
      overlayStyle={{ minWidth: 267 }}
      size={'large'}
      style={{ flex: 1, width: 'unset' }}
      type={'primary'}
    >
      {t('assistants.addAgentAndConverse')}
    </Dropdown.Button>
  );
});

export default AddAgent;
