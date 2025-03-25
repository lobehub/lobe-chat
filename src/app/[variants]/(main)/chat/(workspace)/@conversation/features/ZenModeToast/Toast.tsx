'use client';

import { Hotkey } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

const useStyles = createStyles(({ css, token }) => ({
  closeButton: css`
    color: ${token.colorTextSecondary};
    transition: color 0.2s;

    &:hover {
      color: ${token.colorTextQuaternary};
    }
  `,

  container: css`
    position: fixed;
    z-index: 50;
    inset-block-start: 16px;
    inset-inline-start: 50%;
    transform: translateX(-50%);

    animation: fade-in-slide-down 300ms ease;

    @keyframes fade-in-slide-down {
      from {
        transform: translate(-50%, -16px);
        opacity: 0;
      }

      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
  `,

  text: css`
    font-size: ${token.fontSizeLG}px;
    color: ${token.colorBgBase};
  `,

  toast: css`
    display: flex;
    align-items: center;

    padding-block: 12px;
    padding-inline: 16px;
    border-radius: 9999px;

    background: ${token.colorText};
    box-shadow: ${token.boxShadowSecondary};
  `,
}));

const Toast = () => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const [isVisible, setIsVisible] = useState(true);
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.ToggleZenMode));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.toast}>
        <Flexbox align={'center'} className={styles.text} gap={8} horizontal>
          {t('zenMode')} <Hotkey inverseTheme keys={hotkey} />
        </Flexbox>
      </div>
    </div>
  );
};

export default Toast;
