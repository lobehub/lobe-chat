'use client';

import { TextArea } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { motion } from 'framer-motion';
import { Loader2, Palette, Sparkles } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useImageStore } from '@/store/image';
import { createImageSelectors } from '@/store/image/selectors';
import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

interface PromptInputProps {
  showTitle?: boolean;
  disableAnimation?: boolean;
}

const useStyles = createStyles(({ css, token, responsive }) => ({
  wrapper: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;

    width: 100%;
  `,
  header: css`
    display: flex;
    align-items: center;
    margin-block-end: 8px;
  `,
  icon: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;
    border-radius: ${token.borderRadius}px;

    color: ${token.colorTextSecondary};

    background: transparent;
  `,
  title: css`
    margin: 0;
    font-size: ${token.fontSizeXL}px;
    font-weight: 600;
    color: ${token.colorText};
  `,
  container: css`
    width: 100%;

    /* Default for desktop and larger screens */
    max-width: 680px;
    padding-block: 8px;
    padding-inline: 20px 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG * 2}px;

    background-color: ${token.colorFillTertiary};
    box-shadow: 0 2px 8px ${token.colorFillTertiary};

    /* Overrides for smaller screens */
    ${responsive.laptop} {
      max-width: 600px;
    }

    ${responsive.tablet} {
      max-width: 90%;
    }
  `,
  textArea: css`
    flex: 1;

    padding-block: 8px;
    padding-inline: 0;
    border: none;
    border-radius: 0;

    font-size: ${token.fontSizeLG}px;
    line-height: 1.6;

    background-color: transparent;
    box-shadow: none;

    &::placeholder {
      color: ${token.colorTextTertiary};
    }

    &:hover,
    &:focus,
    &:active {
      border: none;
      background-color: transparent !important;
      box-shadow: none;
    }

    ${responsive.mobile} {
      padding-block: 6px;
      padding-inline: 0;
      font-size: ${token.fontSize}px;
    }
  `,
}));

const useButtonStyles = () =>
  createStyles(({ css, token, responsive }) => ({
    generateButton: css`
      display: flex;
      gap: 8px;
      align-items: center;

      min-height: 54px;
      padding-block: 12px;
      padding-inline: 20px;
      border: none;
      border-radius: ${token.borderRadius * 1.5}px;

      font-size: ${token.fontSize}px;
      font-weight: 600;
      color: #000;

      background: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 10%);

      transition: all 0.2s ease;

      ${responsive.mobile} {
        min-height: 50px;
        padding-block: 10px;
        padding-inline: 16px;
        font-size: ${token.fontSizeSM}px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      &:not(:disabled) {
        cursor: pointer;
      }
    `,
  }));

const PromptInput = ({ showTitle = false, disableAnimation = false }: PromptInputProps) => {
  const { styles } = useStyles();
  const { styles: buttonStyles } = useButtonStyles()();
  const { t } = useTranslation('image');
  const { value, setValue } = useGenerationConfigParam('prompt');
  const isCreating = useImageStore(createImageSelectors.isCreating);
  const createImage = useImageStore((s) => s.createImage);

  const handleGenerate = async () => {
    await createImage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isCreating && value.trim()) {
        handleGenerate();
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      {showTitle && (
        <div className={styles.header}>
          <div className={styles.icon}>
            <Palette size={24} />
          </div>
          <h2 className={styles.title}>{t('config.title')}</h2>
        </div>
      )}
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className={styles.container}
        initial={disableAnimation ? undefined : { opacity: 0, scale: 0.8 }}
        transition={
          disableAnimation
            ? undefined
            : {
                duration: 0.5,
                ease: [0.175, 0.885, 0.32, 1.275],
                type: 'spring',
                damping: 15,
                stiffness: 300,
              }
        }
      >
        <Flexbox align="center" gap={12} height={'100%'} horizontal width={'100%'}>
          <TextArea
            className={`resize-textarea ${styles.textArea}`}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('config.prompt.placeholder')}
            resize
            rows={2}
            value={value}
          />
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={disableAnimation ? undefined : { opacity: 0, scale: 0.8 }}
            transition={disableAnimation ? undefined : { delay: 0.2, duration: 0.4 }}
            whileHover={
              !disableAnimation && !isCreating && value.trim()
                ? { scale: 1.05, transition: { duration: 0.15 } }
                : {}
            }
            whileTap={!disableAnimation && !isCreating && value.trim() ? { scale: 0.95 } : {}}
          >
            <motion.button
              className={buttonStyles.generateButton}
              disabled={isCreating || !value.trim()}
              onClick={handleGenerate}
              whileHover={
                !disableAnimation && !isCreating && value.trim()
                  ? {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                    }
                  : {}
              }
            >
              <motion.div
                animate={isCreating && !disableAnimation ? {} : { rotate: 0 }}
                transition={
                  disableAnimation
                    ? undefined
                    : {
                        duration: 1,
                        repeat: 0,
                        ease: 'linear',
                      }
                }
              >
                {isCreating ? <Loader2 size={18} /> : <Sparkles size={18} />}
              </motion.div>
              <span>
                {isCreating ? t('generation.status.generating') : t('generation.actions.generate')}
              </span>
            </motion.button>
          </motion.div>
        </Flexbox>
      </motion.div>
    </div>
  );
};

export default PromptInput;
