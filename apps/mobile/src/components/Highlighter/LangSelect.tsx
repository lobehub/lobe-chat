import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Select from '@/components/Select';

import { getCodeLanguageDisplayName, supportedLanguageIds } from './const';

interface LangSelectProps {
  onSelect?: (lang: string) => void;
  value: string;
}

const LangSelect = memo<LangSelectProps>(({ value, onSelect }) => {
  const { t } = useTranslation('components');

  // Create language options list with supported languages
  const options = useMemo(
    () =>
      supportedLanguageIds.map((langId) => ({
        title: getCodeLanguageDisplayName(langId),
        value: langId,
      })),
    [],
  );

  return (
    <Select
      bottomSheetProps={{
        snapPoints: ['50%', '90%'],
      }}
      onChange={(val) => onSelect?.(val as string)}
      options={options}
      size="small"
      style={{
        width: '33%',
      }}
      textProps={{
        align: 'center',
        code: true,
        fontSize: 12,
        style: {
          width: '100%',
        },
        type: 'secondary',
      }}
      title={t('Highlighter.selectLanguage')}
      value={value}
      variant="borderless"
    />
  );
});

LangSelect.displayName = 'LangSelect';

export default LangSelect;
