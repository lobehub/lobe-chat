import { Icon, List } from '@lobehub/ui';
import { LucideInbox } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const Inbox = memo(() => {
  const { t } = useTranslation('common');
  const [activeId, switchInbox] = useSessionStore((s) => [s.activeId, s.switchInbox]);

  return (
    <List.Item
      active={activeId === 'inbox'}
      avatar={<Icon icon={LucideInbox} size={'normal'} style={{ padding: 5 }} />}
      onClick={switchInbox}
      title={t('inbox')}
    />
  );
});

export default Inbox;
