import { Button, Flexbox, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DefaultFooter from '@/features/Setting/Footer';
import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';

const useStyles = createStyles(({ css, isDarkMode }) => {
  const image = isDarkMode
    ? '/images/community_footer_dark.webp'
    : '/images/community_footer_light.webp';
  return {
    footer: css`
      min-height: 320px;
      padding-block-start: 32px;

      background-image: url(${image});
      background-repeat: no-repeat;
      background-position: center bottom;
      background-size: 512px auto;
      background-blend-mode: ${isDarkMode ? 'screen' : 'multiply'};
    `,
  };
});

const Footer = memo(() => {
  const { t } = useTranslation('discover');
  const { styles } = useStyles();
  const { isAuthenticated, signIn } = useMarketAuth();
  const [loading, setLoading] = useState(false);
  const handleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      await signIn();
    } catch {
      // User cancelled or error occurred
    }
    setLoading(false);
  }, [signIn]);

  if (isAuthenticated) return <DefaultFooter />;

  return (
    <Flexbox align={'center'} className={styles.footer} flex={'none'} gap={4}>
      <Text align={'center'} as={'h2'} fontSize={22} strong>
        {t('footer.title')}
      </Text>
      <Text align={'center'} fontSize={16} type={'secondary'}>
        {t('footer.desc')}
      </Text>
      <Button
        loading={loading}
        onClick={handleSignIn}
        style={{
          marginTop: 16,
        }}
        type={'primary'}
      >
        {t('user.login')}
      </Button>
    </Flexbox>
  );
});

export default Footer;
