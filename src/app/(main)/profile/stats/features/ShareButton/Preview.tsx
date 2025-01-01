import { Grid } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import { OFFICIAL_URL, imageUrl } from '@/const/url';
import UserAvatar from '@/features/User/UserAvatar';

import TotalMessages from '..//TotalMessages';
import TotalWords from '..//TotalWords';
import AiHeatmaps from '../AiHeatmaps';

const useStyles = createStyles(({ css, token, stylish, cx, responsive }) => ({
  avatar: css`
    box-sizing: content-box;
    background: ${token.colorText};
    border: 4px solid ${token.colorBgLayout};
  `,
  background: css`
    padding: 24px;

    background-color: ${token.colorBgLayout};
    background-image: url(${imageUrl('screenshot_background.webp')});
    background-position: center;
    background-size: 120% 120%;
  `,

  container: css`
    overflow: hidden;

    background: ${token.colorBgLayout};
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG * 2}px;
    box-shadow: ${token.boxShadow};
  `,
  heatmaps: css`
    margin-block: -12px 12px;

    .legend-month,
    footer {
      display: none;
    }
  `,
  preview: cx(
    stylish.noScrollbar,
    css`
      overflow: hidden scroll;

      width: 100%;
      max-height: 70dvh;

      background: ${token.colorBgLayout};
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;

      * {
        pointer-events: none;

        ::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
        }
      }

      ${responsive.mobile} {
        max-height: 40dvh;
      }
    `,
  ),
  title: css`
    font-size: 24px;
    font-weight: bold;
    text-align: center;
  `,
  url: css`
    color: ${token.colorTextDescription};
  `,
}));

const Preview = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('auth');

  return (
    <div className={styles.preview}>
      <div className={styles.background} id={'preview'}>
        <Center className={styles.container} gap={12} padding={24}>
          <ProductLogo size={24} type={'text'} />
          <div className={styles.title}>{t('stats.share.title')}</div>
          <Flexbox align={'center'} horizontal>
            <UserAvatar
              className={styles.avatar}
              size={48}
              style={{
                marginRight: -12,
                zIndex: 2,
              }}
            />
            <Center
              className={styles.avatar}
              height={48}
              style={{
                borderRadius: '50%',
                zIndex: 1,
              }}
              width={48}
            >
              <ProductLogo size={40} />
            </Center>
          </Flexbox>
          <AiHeatmaps
            blockMargin={2}
            blockRadius={1}
            blockSize={4.5}
            className={styles.heatmaps}
            width={'100%'}
          />
          <Grid gap={8} maxItemWidth={100} rows={2} width={'100%'}>
            <TotalMessages inShare />
            <TotalWords inShare />
          </Grid>

          <div className={styles.url}>{OFFICIAL_URL}</div>
        </Center>
      </div>
    </div>
  );
});

export default Preview;
