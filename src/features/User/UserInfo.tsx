'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import UserAvatar from './UserAvatar';

const DEFAULT_USERNAME = 'LobeChat Community Edition';

const useStyles = createStyles(({ css, token }) => ({
  nickname: css`
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
  `,
  username: css`
    line-height: 1;
    color: ${token.colorTextDescription};
  `,
}));

const UserInfo = memo<{ onClick?: () => void }>(({ onClick }) => {
  const { t } = useTranslation('common');
  const { styles, theme } = useStyles();

  const DEFAULT_NICKNAME = t('userPanel.defaultNickname');

  return (
    <Flexbox align={'center'} gap={12} horizontal paddingBlock={12} paddingInline={16}>
      <UserAvatar background={theme.colorFill} onClick={onClick} size={48} />
      <Flexbox flex={1} gap={6}>
        <div className={styles.nickname}>{DEFAULT_NICKNAME}</div>
        <div className={styles.username}>{DEFAULT_USERNAME}</div>
      </Flexbox>
    </Flexbox>
  );
});

export default UserInfo;
