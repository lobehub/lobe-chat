'use client';

import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FlaskConical, Github } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';

import { GITHUB } from '@/const/url';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      width,
      opacity 200ms ${token.motionEaseInOut};
  `,
  hide: css`
    width: 0;
    opacity: 0;
  `,
}));

const Footer = memo<{ expand?: boolean }>(({ expand }) => {
  const { cx, styles } = useStyles();
  const { t } = useTranslation('common');
  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);
  return (
    <Flexbox
      align={'center'}
      className={cx(styles.base, !expand && styles.hide)}
      gap={2}
      horizontal
      padding={8}
    >
      {!hideGitHub && (
        <a aria-label={'GitHub'} href={GITHUB} rel="noopener noreferrer" target={'_blank'}>
          <ActionIcon icon={Github} size={16} title={'GitHub'} />
        </a>
      )}
      <Link aria-label={t('labs')} to={'/labs'}>
        <ActionIcon icon={FlaskConical} size={16} title={t('labs')} />
      </Link>
    </Flexbox>
  );
});

export default Footer;
