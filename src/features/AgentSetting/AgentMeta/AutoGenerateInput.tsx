import { ActionIcon } from '@lobehub/ui';
import { Input, InputProps } from 'antd';
import { useTheme } from 'antd-style';
import { Wand2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export interface AutoGenerateInputProps extends InputProps {
  canAutoGenerate?: boolean;
  loading?: boolean;
  onGenerate?: () => void;
}

const AutoGenerateInput = memo<AutoGenerateInputProps>(
  ({ loading, onGenerate, canAutoGenerate, ...props }) => {
    const { t } = useTranslation('common');
    const theme = useTheme();

    return (
      <Input
        suffix={
          onGenerate && (
            <ActionIcon
              active
              disable={!canAutoGenerate}
              icon={Wand2}
              loading={loading}
              onClick={onGenerate}
              size="small"
              style={{
                color: theme.colorInfo,
                marginRight: -4,
              }}
              title={!canAutoGenerate ? t('autoGenerateTooltipDisabled') : t('autoGenerate')}
            />
          )
        }
        type="block"
        {...props}
      />
    );
  },
);

export default AutoGenerateInput;
