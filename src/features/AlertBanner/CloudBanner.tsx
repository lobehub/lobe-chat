'use client';

import { Icon } from '@lobehub/ui';
import { useSize } from 'ahooks';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { memo, useEffect, useRef, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { LOBE_CHAT_CLOUD } from '@/const/branding';
import { OFFICIAL_URL, UTM_SOURCE } from '@/const/url';
import { isOnServerSide } from '@/utils/env';

export const BANNER_HEIGHT = 40;

const useStyles = createStyles(({ css, token, stylish, cx, isDarkMode }) => ({
  background: cx(
    stylish.gradientAnimation,
    css`
      position: absolute;

      width: max(64%, 1280px);
      height: 100%;

      opacity: 0.8;
      filter: blur(60px);
    `,
  ),
  container: css`
    position: relative;
    overflow: hidden;
    background-color: ${isDarkMode ? token.colorFill : token.colorFillSecondary};
  `,
  wrapper: css`
    z-index: 1;
    overflow: hidden;
    max-width: 100%;
  `,
}));

const CloudBanner = memo<{ mobile?: boolean }>(({ mobile }) => {
  const ref = useRef(null);
  const contentRef = useRef(null);
  const size = useSize(ref);
  const contentSize = useSize(contentRef);
  const { styles } = useStyles();
  const { t } = useTranslation('common');
  const [isTruncated, setIsTruncated] = useState(mobile);

  useEffect(() => {
    if (mobile || isOnServerSide || !size || !contentSize) return;
    setIsTruncated(contentSize.width > size.width - 120);
  }, [size, contentSize, mobile]);

  const content = (
    <Flexbox align={'center'} flex={'none'} gap={8} horizontal ref={contentRef}>
      <b>{t('alert.cloud.title', { name: LOBE_CHAT_CLOUD })}:</b>
      <span>
        {t(mobile ? 'alert.cloud.descOnMobile' : 'alert.cloud.desc', {
          credit: new Intl.NumberFormat('en-US').format(450_000),
          name: LOBE_CHAT_CLOUD,
        })}
      </span>
    </Flexbox>
  );
  return (
    <Center
      className={styles.container}
      flex={'none'}
      height={BANNER_HEIGHT}
      paddingInline={16}
      ref={ref}
      width={'100%'}
    >
      <div className={styles.background} />
      <Center className={styles.wrapper} gap={16} horizontal width={'100%'}>
        {isTruncated ? <Marquee pauseOnHover>{content}</Marquee> : content}
        <Link href={`${OFFICIAL_URL}?utm_source=${UTM_SOURCE}&utm_medium=banner`} target={'_blank'}>
          <Button size={'small'} type="primary">
            {t('alert.cloud.action')} <Icon icon={ArrowRightIcon} />
          </Button>
        </Link>
      </Center>
    </Center>
  );
});

export default CloudBanner;
