import { Github } from '@lobehub/icons';
import { Grid } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import { OFFICIAL_URL, imageUrl } from '@/const/url';
import { isServerMode } from '@/const/version';
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
    position: relative;

    width: 100%;
    padding: 24px;

    background-color: ${token.colorBgLayout};
    background-image: url(${imageUrl('screenshot_background.webp')});
    background-position: center;
    background-size: 120% 120%;
  `,

  container: css`
    position: relative;

    overflow: hidden;

    width: 100%;

    background: ${token.colorBgLayout};
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG * 2}px;
    box-shadow: ${token.boxShadow};
  `,
  decs: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  footer: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  heatmaps: css`
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
}));

const Preview = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('auth');
  const isOfficial = !isServerMode && OFFICIAL_URL.includes(location.host);

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
          <Flexbox gap={12} paddingBlock={12} width={'100%'}>
            <AiHeatmaps
              blockMargin={2}
              blockRadius={1}
              blockSize={4.5}
              className={styles.heatmaps}
              inShare
              style={{
                marginTop: -12,
              }}
              width={'100%'}
            />
            <Grid gap={8} maxItemWidth={100} rows={2} width={'100%'}>
              <TotalMessages inShare />
              <TotalWords inShare />
            </Grid>
          </Flexbox>
          <div className={styles.footer}>
            {isOfficial ? (
              OFFICIAL_URL
            ) : (
              <Flexbox align={'center'} gap={8} horizontal>
                <Github size={16} />
                <span>lobehub/lobe-chat</span>
              </Flexbox>
            )}
          </div>
        </Center>
      </div>
    </div>
  );
});

export default Preview;
