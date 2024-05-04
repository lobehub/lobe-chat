import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import UserAvatar from '@/features/User/UserAvatar';

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

// TODO

const UserInfo = memo<{ onClick?: () => void }>(({ onClick }) => {
  const { styles, theme } = useStyles();

  return (
    <Flexbox align={'center'} gap={12} horizontal paddingBlock={12} paddingInline={16}>
      <UserAvatar background={theme.colorFill} onClick={onClick} size={48} />
      <Flexbox flex={1} gap={6}>
        <div className={styles.nickname}>{'社区版用户'}</div>
        <div className={styles.username}> {'Community Edition'}</div>
      </Flexbox>
    </Flexbox>
  );
});

export default UserInfo;
