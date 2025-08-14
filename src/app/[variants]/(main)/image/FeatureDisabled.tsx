'use client';

import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { AlertCircle, FileImage, Settings } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const BLOCK_SIZE = 100;
const ICON_SIZE = { size: 72, strokeWidth: 1.5 };

const useStyles = createStyles(({ css, token }) => ({
  icon: css`
    border-radius: ${token.borderRadiusLG}px;
    color: ${token.colorTextLightSolid};
  `,
  iconGroup: css`
    margin-block-start: -44px;
  `,
}));

const FeatureDisabled = memo(() => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { styles } = useStyles();

  return (
    <Center gap={40} height={'100%'} width={'100%'}>
      <Flexbox className={styles.iconGroup} gap={12} horizontal>
        <Center
          className={styles.icon}
          height={BLOCK_SIZE * 1.25}
          style={{
            background: theme.colorFillTertiary,
            transform: 'rotateZ(-20deg) translateX(10px)',
          }}
          width={BLOCK_SIZE}
        >
          <Icon icon={FileImage} size={ICON_SIZE} />
        </Center>
        <Center
          className={styles.icon}
          height={BLOCK_SIZE * 1.25}
          style={{
            background: theme.colorError,
            transform: 'translateY(-22px)',
            zIndex: 1,
          }}
          width={BLOCK_SIZE}
        >
          <Icon icon={AlertCircle} size={ICON_SIZE} />
        </Center>
        <Center
          className={styles.icon}
          height={BLOCK_SIZE * 1.25}
          style={{
            background: theme.colorFillTertiary,
            transform: 'rotateZ(20deg) translateX(-10px)',
          }}
          width={BLOCK_SIZE}
        >
          <Icon icon={Settings} size={ICON_SIZE} />
        </Center>
      </Flexbox>

      <Flexbox justify={'center'} style={{ textAlign: 'center' }}>
        <Typography.Title>{t('aiImage.disabled.title')}</Typography.Title>
        <Typography.Text type={'secondary'}>{t('aiImage.disabled.description')}</Typography.Text>
      </Flexbox>
    </Center>
  );
});

FeatureDisabled.displayName = 'FeatureDisabled';

export default FeatureDisabled;
