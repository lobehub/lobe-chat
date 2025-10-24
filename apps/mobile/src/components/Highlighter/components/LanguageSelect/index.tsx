import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Select from '@/components/Select';

import supportedLanguageIds, { getLanguageDisplayName } from '../../hooks/supportedLanguages';
import { useStyles } from './style';

interface LanguageSelectProps {
  onSelect: (lang: string) => void;
  value: string;
}

export const LanguageSelect = memo<LanguageSelectProps>(({ value, onSelect }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('components');

  // 创建语言选项列表，只包含支持的语言
  const options = useMemo(
    () =>
      supportedLanguageIds.map((langId) => ({
        title: getLanguageDisplayName(langId),
        value: langId,
      })),
    [],
  );

  return (
    <Select
      onChange={(val) => onSelect(val as string)}
      options={options}
      size="small"
      style={styles.select}
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

LanguageSelect.displayName = 'LanguageSelect';
