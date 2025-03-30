import { ActionIcon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Wand2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

export interface AutoGenerateAvatarProps {
  background?: string;
  canAutoGenerate?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
  onGenerate?: () => void;
  value?: string;
}

const AutoGenerateAvatar = memo<AutoGenerateAvatarProps>(
  ({ loading, background, value, onChange, onGenerate, canAutoGenerate }) => {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

    return (
      <Flexbox padding={8}>
        <div style={{ opacity: loading ? 0.6 : undefined }}>
          <EmojiPicker
            background={background || theme.colorFillTertiary}
            locale={locale}
            onChange={onChange}
            size={64}
            style={{
              border: `1px solid ${theme.colorBorder}`,
            }}
            value={value}
          />
        </div>
        <ActionIcon
          disabled={!canAutoGenerate}
          glass
          icon={Wand2}
          loading={loading}
          onClick={onGenerate}
          size="small"
          style={{
            bottom: 4,
            insetInlineEnd: 4,
            position: 'absolute',
          }}
          title={!canAutoGenerate ? t('autoGenerateTooltipDisabled') : t('autoGenerate')}
          variant={'filled'}
        />
      </Flexbox>
    );
  },
);

export default AutoGenerateAvatar;
