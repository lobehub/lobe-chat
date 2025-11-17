'use client';

import { createStyles } from 'antd-style';
import { Command } from 'cmdk';
import { BookOpen, Palette, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useHotkeyById } from '@/hooks/useHotkeys/useHotkeyById';
import { HotkeyEnum } from '@/types/hotkey';

const useStyles = createStyles(({ css, token }) => ({
  commandRoot: css`
    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: min(640px, 90vw);
    max-height: min(500px, 70vh);
    margin-block-start: -10vh;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgElevated};
    box-shadow: ${token.boxShadowSecondary};

    animation: slide-down 0.2s ease-out;

    @keyframes slide-down {
      from {
        transform: translateY(-20px) scale(0.96);
        opacity: 0;
      }

      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    [cmdk-input] {
      width: 100%;
      padding: 16px;
      border: none;
      border-block-end: 1px solid ${token.colorBorderSecondary};

      font-family: inherit;
      font-size: 16px;
      color: ${token.colorText};

      background: transparent;
      outline: none;

      &::placeholder {
        color: ${token.colorTextPlaceholder};
      }
    }

    [cmdk-list] {
      overflow-y: auto;
      max-height: 400px;
      padding: 8px;
    }

    [cmdk-empty] {
      padding-block: 32px;
      padding-inline: 16px;

      font-size: 14px;
      color: ${token.colorTextTertiary};
      text-align: center;
    }

    [cmdk-item] {
      cursor: pointer;
      user-select: none;

      display: flex;
      gap: 12px;
      align-items: center;

      padding-block: 12px;
      padding-inline: 16px;
      border-radius: ${token.borderRadius}px;

      color: ${token.colorText};

      transition: all 0.15s ease;

      &[aria-selected='true'] {
        background: ${token.colorBgTextHover};
      }

      &:hover {
        background: ${token.colorBgTextHover};
      }
    }
  `,
  icon: css`
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: ${token.colorTextSecondary};
  `,
  itemContent: css`
    flex: 1;
    min-width: 0;
  `,
  itemDescription: css`
    margin-block-start: 2px;
    font-size: 12px;
    line-height: 1.4;
    color: ${token.colorTextTertiary};
  `,
  itemLabel: css`
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  `,
  overlay: css`
    position: fixed;
    z-index: 9999;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    background: ${token.colorBgMask};

    animation: fade-in 0.15s ease-in-out;

    @keyframes fade-in {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }
  `,
}));

const Cmdk = memo(() => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  // Ensure we're mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Register Cmd+K / Ctrl+K hotkey
  useHotkeyById(HotkeyEnum.CommandPalette, () => {
    setOpen((prev) => !prev);
  });

  // Close on Escape key and prevent body scroll
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open]);

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <Command className={styles.commandRoot} shouldFilter={true}>
          <Command.Input autoFocus placeholder={t('cmdk.searchPlaceholder')} />
          <Command.List>
            <Command.Empty>{t('cmdk.noResults')}</Command.Empty>
            <Command.Item onSelect={() => handleNavigate('/settings')} value="settings">
              <Settings className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.openSettings')}</div>
              </div>
            </Command.Item>
            <Command.Item onSelect={() => handleNavigate('/image')} value="painting">
              <Palette className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.painting')}</div>
              </div>
            </Command.Item>
            <Command.Item onSelect={() => handleNavigate('/knowledge')} value="knowledge">
              <BookOpen className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.knowledgeBase')}</div>
              </div>
            </Command.Item>
          </Command.List>
        </Command>
      </div>
    </div>,
    document.body,
  );
});

Cmdk.displayName = 'Cmdk';

export default Cmdk;
