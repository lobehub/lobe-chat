'use client';

import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { BrowserIcon } from '@/components/BrowserIcon';
import { MAX_WIDTH } from '@/const/layoutTokens';

import SystemIcon from '../components/SystemIcon';
import Card from './Card';
import DeviceName from './DeviceName';

const useStyles = createStyles(({ css, cx, responsive, isDarkMode, token, stylish }) => ({
  cards: css`
    flex-direction: row;
    ${responsive.mobile} {
      flex-direction: column;
      width: 100%;
    }
  `,
  container: css`
    position: relative;
    width: 100%;
    border-radius: ${token.borderRadiusLG}px;
  `,
  content: cx(
    stylish.blurStrong,
    css`
      z-index: 2;

      flex-direction: row;
      justify-content: space-between;

      height: 88px;
      padding: 12px;

      background: ${rgba(token.colorBgContainer, isDarkMode ? 0.7 : 1)};
      border-radius: ${token.borderRadiusLG - 1}px;

      ${responsive.mobile} {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;

        width: 100%;
        padding: 8px;
      }
    `,
  ),
  glow: cx(
    stylish.gradientAnimation,
    css`
      pointer-events: none;
      opacity: 0.5;
      background-image: linear-gradient(
        -45deg,
        ${isDarkMode ? token.geekblue4 : token.geekblue},
        ${isDarkMode ? token.cyan4 : token.cyan}
      );
      animation-duration: 10s;
    `,
  ),
  wrapper: css`
    ${responsive.mobile} {
      padding-block: 8px;
      padding-inline: 4px;
    }
  `,
}));

interface DeviceCardProps {
  browser?: string;
  os?: string;
}

const DeviceCard = memo<DeviceCardProps>(({ browser, os }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('setting');

  return (
    <Flexbox
      className={styles.wrapper}
      style={{ maxWidth: MAX_WIDTH, position: 'relative' }}
      width={'100%'}
    >
      <Flexbox className={styles.container} padding={4}>
        <Flexbox horizontal paddingBlock={8} paddingInline={12}>
          <div>
            <Typography style={{ fontWeight: 'bold' }}>{t('sync.device.title')}</Typography>
          </div>
        </Flexbox>
        <Flexbox align={'center'} className={styles.content} flex={1} padding={12}>
          <DeviceName />
          <Flexbox className={styles.cards} gap={12}>
            <Card icon={<SystemIcon title={os} />} title={os || t('sync.device.unknownOS')} />
            <Card
              icon={browser && <BrowserIcon browser={browser} size={32} />}
              title={browser || t('sync.device.unknownBrowser')}
            />
          </Flexbox>
        </Flexbox>
        <Flexbox
          className={styles.glow}
          height={'100%'}
          style={{ left: 0, position: 'absolute', top: 0 }}
          width={'100%'}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default DeviceCard;
