import { createModal } from '@lobehub/ui';
import { t } from 'i18next';

import { Content } from './Content';

export const openCreateChannel = (onCreated: (id: string) => void) =>
  createModal({
    content: <Content onCreated={onCreated} />,
    footer: null,
    title: t('create', { ns: 'channel' }),
    width: 'min(90vw, 640px)',
  });
