import { ChatHeader, Logo, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    color: ${token.colorText};
    fill: ${token.colorText};
  `,
}));

const Header = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');

  return (
    <ChatHeader
      left={
        <Link href={'/'}>
          <Logo className={styles.logo} extra={t('tab.market')} size={36} type={'text'} />
        </Link>
      }
      right={<SearchBar allowClear spotlight type={'ghost'} />}
    />
  );
});

export default Header;
