'use client';

import { Button, Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { SmilePlus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

import { usePageEditorContext } from '../Context';

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

const Title = memo(() => {
  const { t } = useTranslation('file');
  const theme = useTheme();
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

  const {
    currentEmoji,
    currentTitle,
    setCurrentEmoji,
    setCurrentTitle,
    debouncedSave,
    handleTitleSubmit,
  } = usePageEditorContext();

  const [isHoveringTitle, setIsHoveringTitle] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <Flexbox
      onMouseEnter={() => setIsHoveringTitle(true)}
      onMouseLeave={() => setIsHoveringTitle(false)}
      style={{ marginBottom: 24 }}
    >
      {/* Emoji picker above Choose Icon button */}
      {(currentEmoji || showEmojiPicker) && (
        <Flexbox style={{ marginBottom: 4 }}>
          <EmojiPicker
            allowDelete
            locale={locale}
            onChange={(emoji) => {
              setCurrentEmoji(emoji);
              setShowEmojiPicker(false);
              debouncedSave();
            }}
            onDelete={() => {
              setCurrentEmoji(undefined);
              setShowEmojiPicker(false);
              debouncedSave();
            }}
            onOpenChange={(open) => {
              setShowEmojiPicker(open);
            }}
            open={showEmojiPicker}
            size={80}
            style={{
              fontSize: 80,
              transform: 'translateX(-6px)',
            }}
            title={t('documentEditor.chooseIcon')}
            value={currentEmoji}
          />
        </Flexbox>
      )}

      {/* Choose Icon button - only shown when no emoji */}
      <Flexbox style={{ marginBottom: 12 }}>
        <Button
          icon={<Icon icon={SmilePlus} />}
          onClick={() => {
            setCurrentEmoji('📄');
            setShowEmojiPicker(true);
          }}
          size="small"
          style={{
            opacity: isHoveringTitle && !currentEmoji && !showEmojiPicker ? 1 : 0,
            transform: 'translateX(-6px)',
            transition: `opacity ${theme.motionDurationMid} ${theme.motionEaseInOut}`,
            width: 'fit-content',
          }}
          type="text"
        >
          {t('documentEditor.chooseIcon')}
        </Button>
      </Flexbox>

      {/* Title Input */}
      <Flexbox align="center" direction="horizontal" gap={8}>
        <input
          onChange={(e) => {
            setCurrentTitle(e.target.value);
            debouncedSave();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleTitleSubmit();
            }
          }}
          placeholder={t('documentEditor.titlePlaceholder')}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.colorText,
            flex: 1,
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.2,
            outline: 'none',
          }}
          value={currentTitle}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default Title;
