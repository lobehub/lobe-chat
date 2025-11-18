'use client';

import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Command } from 'cmdk';
import { ArrowLeft, BookOpen, Monitor, Moon, Palette, Settings, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useHotkeyById } from '@/hooks/useHotkeys/useHotkeyById';
import { useGlobalStore } from '@/store/global';
import { HotkeyEnum } from '@/types/hotkey';

const useStyles = createStyles(({ css, token }) => ({
  backTag: css`
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  `,
  commandRoot: css`
    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: min(640px, 90vw);
    max-height: min(500px, 70vh);
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
      flex: 1;

      min-width: 0;
      padding: 0;
      border: none;

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

    [cmdk-group-heading] {
      user-select: none;

      padding-block: 8px;
      padding-inline: 16px;

      font-size: 12px;
      font-weight: 500;
      color: ${token.colorTextSecondary};
    }

    [cmdk-separator] {
      height: 1px;
      margin-block: 4px;
      background: ${token.colorBorderSecondary};
    }
  `,
  icon: css`
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: ${token.colorTextSecondary};
  `,
  inputWrapper: css`
    display: flex;
    gap: 8px;
    align-items: center;

    padding: 16px;
    border-block-end: 1px solid ${token.colorBorderSecondary};
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
    justify-content: center;

    padding-block-start: 15vh;

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
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const switchThemeMode = useGlobalStore((s) => s.switchThemeMode);

  const page = pages.at(-1);

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

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  // Reset pages and search when opening/closing
  useEffect(() => {
    if (open) {
      setPages([]);
      setSearch('');
    }
  }, [open]);

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    switchThemeMode(theme);
    setOpen(false);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <Command
          className={styles.commandRoot}
          onKeyDown={(e) => {
            // Escape goes to previous page or closes
            if (e.key === 'Escape') {
              e.preventDefault();
              if (pages.length > 0) {
                setPages((prev) => prev.slice(0, -1));
              } else {
                setOpen(false);
              }
            }
            // Backspace goes to previous page when search is empty
            if (e.key === 'Backspace' && !search && pages.length > 0) {
              e.preventDefault();
              setPages((prev) => prev.slice(0, -1));
            }
          }}
          shouldFilter={true}
        >
          <div className={styles.inputWrapper}>
            {pages.length > 0 && (
              <Tag
                className={styles.backTag}
                icon={<ArrowLeft size={12} />}
                onClick={() => setPages((prev) => prev.slice(0, -1))}
              />
            )}
            <Command.Input
              autoFocus
              onValueChange={setSearch}
              placeholder={t('cmdk.searchPlaceholder')}
              value={search}
            />
            <Tag>ESC</Tag>
          </div>
          <Command.List>
            <Command.Empty>{t('cmdk.noResults')}</Command.Empty>

            {!page && (
              <>
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
                <Command.Item onSelect={() => setPages([...pages, 'theme'])} value="theme">
                  <Monitor className={styles.icon} />
                  <div className={styles.itemContent}>
                    <div className={styles.itemLabel}>{t('cmdk.theme')}</div>
                  </div>
                </Command.Item>
              </>
            )}

            {page === 'theme' && (
              <>
                <Command.Item onSelect={() => handleThemeChange('light')} value="theme-light">
                  <Sun className={styles.icon} />
                  <div className={styles.itemContent}>
                    <div className={styles.itemLabel}>{t('cmdk.themeLight')}</div>
                  </div>
                </Command.Item>
                <Command.Item onSelect={() => handleThemeChange('dark')} value="theme-dark">
                  <Moon className={styles.icon} />
                  <div className={styles.itemContent}>
                    <div className={styles.itemLabel}>{t('cmdk.themeDark')}</div>
                  </div>
                </Command.Item>
                <Command.Item onSelect={() => handleThemeChange('auto')} value="theme-auto">
                  <Monitor className={styles.icon} />
                  <div className={styles.itemContent}>
                    <div className={styles.itemLabel}>{t('cmdk.themeAuto')}</div>
                  </div>
                </Command.Item>
              </>
            )}
          </Command.List>
        </Command>
      </div>
    </div>,
    document.body,
  );
});

Cmdk.displayName = 'Cmdk';

export default Cmdk;
