'use client';

import { createModal } from '@lobehub/ui';
import { t } from 'i18next';

import ImportIssuesContent from './ImportIssuesContent';
import type { LinearIssueImportModalOptions } from './types';

export const openLinearIssueImportModal = (options: LinearIssueImportModalOptions) =>
  createModal({
    content: <ImportIssuesContent {...options} />,
    footer: null,
    maskClosable: false,
    title: t('linear.sync.modal.title', {
      account: options.connection.organizationName,
      ns: 'integration',
    }),
    width: 'min(92%, 760px)',
  });
