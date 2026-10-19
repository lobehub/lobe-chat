'use client';

import { confirmModal } from '@lobehub/ui';
import { t } from 'i18next';
import type { ReactNode } from 'react';

interface ConfirmRemoveTopicOptions {
  content?: ReactNode;
  okText?: string;
  onConfirm: () => Promise<void> | void;
  title?: string;
}

/**
 * Open the shared topic deletion confirmation. It opens immediately and offers
 * no attachment choice: callers always request file cleanup, which the server
 * limits at purge time to files nothing outside the topic still references.
 */
export const confirmRemoveTopic = ({
  content,
  okText,
  onConfirm,
  title,
}: ConfirmRemoveTopicOptions) => {
  confirmModal({
    cancelText: t('cancel', { ns: 'common' }),
    content: content ?? t('actions.confirmRemoveTopic', { ns: 'topic' }),
    okButtonProps: { danger: true },
    okText: okText ?? t('actions.removeTopic', { ns: 'topic' }),
    onOk: async () => {
      await onConfirm();
    },
    title: title ?? t('actions.confirmRemoveTopicTitle', { ns: 'topic' }),
  });
};
