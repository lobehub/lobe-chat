'use client';

import { Button, TextArea } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Sparkles } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { loginRequired } from '@/components/Error/loginRequiredNotification';
import { useImageStore } from '@/store/image';
import { createImageSelectors } from '@/store/image/selectors';
import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

import PromptTitle from './Title';

interface PromptInputProps {
  disableAnimation?: boolean;
  showTitle?: boolean;
}

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG * 1.5}px;
    background-color: ${token.colorBgContainer};
    box-shadow:
      ${token.boxShadowTertiary},
      ${isDarkMode
        ? `0 0 48px 32px ${token.colorBgContainerSecondary}`
        : `0 0 0  ${token.colorBgContainerSecondary}`},
      0 32px 0 ${token.colorBgContainerSecondary};
  `,
  wrapper: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;

    width: 100%;
  `,
}));

const PromptInput = ({ showTitle = false }: PromptInputProps) => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');
  const { value, setValue } = useGenerationConfigParam('prompt');
  const isCreating = useImageStore(createImageSelectors.isCreating);
  const createImage = useImageStore((s) => s.createImage);
  const isLogin = useUserStore(authSelectors.isLogin);

  const handleGenerate = async () => {
    if (!isLogin) {
      loginRequired.redirect({ timeout: 2000 });
      return;
    }

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
    <Flexbox
      gap={32}
      style={{
        marginTop: 48,
      }}
      width={'100%'}
    >
      {showTitle && <PromptTitle />}

      <Flexbox
        align="flex-end"
        className={styles.container}
        gap={12}
        height={'100%'}
        horizontal
        padding={'12px 12px 12px 16px'}
        width={'100%'}
      >
        <TextArea
          autoSize={{ maxRows: 6, minRows: 3 }}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('config.prompt.placeholder')}
          style={{
            borderRadius: 0,
            padding: 0,
          }}
          value={value}
          variant={'borderless'}
        />
        <Button
          disabled={!value}
          icon={Sparkles}
          loading={isCreating}
          onClick={handleGenerate}
          size={'large'}
          style={{
            fontWeight: 500,
            height: 64,
            minWidth: 64,
            width: 64,
          }}
          title={isCreating ? t('generation.status.generating') : t('generation.actions.generate')}
          type={'primary'}
        />
      </Flexbox>
    </Flexbox>
  );
};

export default PromptInput;
