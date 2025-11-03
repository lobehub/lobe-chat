import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import MaterialFileTypeIcon from '@/components/MaterialFileTypeIcon';
import Select from '@/components/Select';

import { getCodeLanguageDisplayName, getCodeLanguageFilename, supportedLanguageIds } from './const';

export interface LangSelectProps {
  filetype?: string;
  onSelect?: (lang: string) => void;
  showIcon?: boolean;
  value: string;
}

const LangSelect = memo<LangSelectProps>(({ value, onSelect, showIcon = false }) => {
  const { t } = useTranslation('components');

  // Create language options list with supported languages
  const options = useMemo(
    () =>
      supportedLanguageIds.map((langId) => ({
        icon: (
          <MaterialFileTypeIcon
            fallbackUnknownType={false}
            filename={getCodeLanguageFilename(langId)}
            size={16}
            type="file"
          />
        ),
        title: getCodeLanguageDisplayName(langId),
        value: langId,
      })),
    [showIcon],
  );

  return (
    <View
      style={{
        width: '33%',
      }}
    >
      <Select
        bottomSheetProps={{
          snapPoints: ['50%', '90%'],
        }}
        onChange={(val) => onSelect?.(val as string)}
        options={options}
        size="small"
        textProps={{
          code: true,
          ellipsis: true,
          fontSize: 12,
          style: {
            width: 64,
          },
          type: 'secondary',
        }}
        title={t('Highlighter.selectLanguage')}
        value={value}
        variant="borderless"
      />
    </View>
  );
});

LangSelect.displayName = 'LangSelect';

export default LangSelect;
