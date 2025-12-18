import { EmojiPickerProps, EmojiPicker as LobeEmojiPicker } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

export const EmojiPicker = memo<EmojiPickerProps>(({ shape = 'square', ...rest }) => {
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const { t } = useTranslation('components');

  return (
    <LobeEmojiPicker
      shape={shape}
      {...rest}
      locale={locale}
      texts={{
        delete: t('EmojiPicker.delete'),
        draggerDesc: t('EmojiPicker.draggerDesc'),
        emoji: t('EmojiPicker.emoji'),
        fileTypeError: t('EmojiPicker.fileTypeError'),
        upload: t('EmojiPicker.upload'),
        uploadBtn: t('EmojiPicker.uploadBtn'),
      }}
    />
  );
});

export default EmojiPicker;
