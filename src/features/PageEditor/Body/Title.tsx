'use client';

import { Button, Icon, TextArea } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { SmilePlus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

import { usePageEditorStore } from '../store';

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

const Title = memo(() => {
  const { t } = useTranslation('file');
  const theme = useTheme();
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

  const currentEmoji = usePageEditorStore((s) => s.currentEmoji);
  const currentTitle = usePageEditorStore((s) => s.currentTitle);
  const setCurrentEmoji = usePageEditorStore((s) => s.setCurrentEmoji);
  const setCurrentTitle = usePageEditorStore((s) => s.setCurrentTitle);
  const handleTitleSubmit = usePageEditorStore((s) => s.handleTitleSubmit);

  const [isHoveringTitle, setIsHoveringTitle] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <Flexbox
      gap={16}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseEnter={() => setIsHoveringTitle(true)}
      onMouseLeave={() => setIsHoveringTitle(false)}
      paddingBlock={16}
      style={{
        cursor: 'default',
      }}
    >
      {/* Emoji picker above Choose Icon button */}
      {(currentEmoji || showEmojiPicker) && (
        <EmojiPicker
          allowDelete
          locale={locale}
          onChange={(emoji) => {
            setCurrentEmoji(emoji);
            setShowEmojiPicker(false);
          }}
          onDelete={() => {
            setCurrentEmoji(undefined);
            setShowEmojiPicker(false);
          }}
          onOpenChange={(open) => {
            setShowEmojiPicker(open);
          }}
          open={showEmojiPicker}
          shape={'square'}
          size={72}
          title={t('documentEditor.chooseIcon')}
          value={currentEmoji}
        />
      )}

      {/* Choose Icon button - only shown when no emoji */}
      {!currentEmoji && !showEmojiPicker && (
        <Button
          icon={<Icon icon={SmilePlus} />}
          onClick={() => {
            setCurrentEmoji('📄');
            setShowEmojiPicker(true);
          }}
          size="small"
          style={{
            opacity: isHoveringTitle ? 1 : 0,
            transition: `opacity ${theme.motionDurationMid} ${theme.motionEaseInOut}`,
            width: 'fit-content',
          }}
          type="text"
        >
          {t('documentEditor.chooseIcon')}
        </Button>
      )}

      {/* Title Input */}
      <TextArea
        autoSize={{ minRows: 1 }}
        onChange={(e) => {
          setCurrentTitle(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleTitleSubmit();
          }
        }}
        placeholder={t('documentEditor.titlePlaceholder')}
        style={{
          fontSize: 36,
          fontWeight: 600,
          padding: 0,
          resize: 'none',
          width: '100%',
        }}
        value={currentTitle}
        variant={'borderless'}
      />
    </Flexbox>
  );
});

export default Title;
