'use client';

import { LobeHub } from '@lobehub/ui/brand';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { ORG_NAME } from '@/const/branding';
import { OFFICIAL_URL, UTM_SOURCE } from '@/const/url';
import { isCustomORG } from '@/const/version';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { ProductLogo } from '../Branding';

const useStyles = createStyles(({ token, css }) => ({
  customLogo: css`
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;

    color: inherit;

    &:hover {
      color: ${token.colorLink};
    }
  `,
  logoLink: css`
    line-height: 1;
    color: inherit;

    &:hover {
      color: ${token.colorLink};
    }
  `,
}));

const BrandWatermark = memo<Omit<FlexboxProps, 'children'>>(({ style, ...rest }) => {
  const { styles, theme } = useStyles();
  const { enableCommercialBranding } = useServerConfigStore(featureFlagsSelectors);

  return (
    <Flexbox
      align={'center'}
      flex={'none'}
      gap={4}
      horizontal
      style={{ color: theme.colorTextDescription, fontSize: 12, ...style }}
      {...rest}
    >
      <span>Powered by</span>
      {isCustomORG ? (
        enableCommercialBranding ? (
          <Link className={styles.customLogo} href={`${OFFICIAL_URL}`} target={'_blank'}>
            <ProductLogo size={20} type={'mono'} />
            <span>{ORG_NAME}</span>
          </Link>
        ) : (
          <span>{ORG_NAME}</span>
        )
      ) : (
        <Link
          className={styles.logoLink}
          href={`https://lobehub.com?utm_source=${UTM_SOURCE}&utm_content=brand_watermark`}
          target={'_blank'}
        >
          <LobeHub size={20} type={'text'} />
        </Link>
      )}
    </Flexbox>
  );
});

export default BrandWatermark;
