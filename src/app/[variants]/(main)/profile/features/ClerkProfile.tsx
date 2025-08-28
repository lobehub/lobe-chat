'use client';

import { UserProfile } from '@clerk/nextjs';
import { ElementsConfig } from '@clerk/types';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';

import { handleAccountDeleted } from '@/utils/account';

import DeleteAccountModal from './DeleteAccountModal';

export const useStyles = createStyles(
  ({ css, responsive, token }) =>
    ({
      cardBox: css`
        width: 100%;
        min-width: 100%;
        background: transparent;
      `,
      footer: css`
        display: none !important;
      `,
      headerTitle: css`
        ${responsive.mobile} {
          margin: 0;
          padding: 16px;

          font-size: 14px;
          font-weight: 400;
          line-height: 24px;

          opacity: 0.5;
        }
      `,
      navbar: css`
        display: none !important;
      `,
      navbarMobileMenuRow: css`
        display: none !important;
      `,
      pageScrollBox: css`
        padding: 0;
      `,
      profileSection: css`
        ${responsive.mobile} {
          padding-inline: 16px;
          background: ${token.colorBgContainer};
        }
      `,
      rootBox: css`
        width: 100%;
        height: 100%;
      `,
      scrollBox: css`
        background: transparent;
      `,
    }) as Partial<Record<keyof ElementsConfig, any>>,
);

const handleDeleteAccountConfirm = async () => {
  await handleAccountDeleted();
};

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { styles } = useStyles(mobile);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div>
      <UserProfile
        appearance={{
          elements: styles,
        }}
        path={'/profile'}
      />

      <Button
        danger
        onClick={() => setShowDeleteModal(true)}
        type="primary"
      >
        注销账户
      </Button>

      <DeleteAccountModal
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccountConfirm}
        open={showDeleteModal}
      />
    </div>
  );
});

export default Client;
