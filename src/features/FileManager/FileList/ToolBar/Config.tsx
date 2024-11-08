import { Switch } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface ConfigProps {
  config: { showFilesInKnowledgeBase: boolean };
  onConfigChange: (config: { showFilesInKnowledgeBase: boolean }) => void;
}

const Config = memo<ConfigProps>(({ config, onConfigChange }) => {
  const { t } = useTranslation('components');

  return (
    <Flexbox
      gap={6}
      horizontal
      onClick={() => {
        onConfigChange({ showFilesInKnowledgeBase: !config.showFilesInKnowledgeBase });
      }}
    >
      <Switch size={'small'} value={config.showFilesInKnowledgeBase} />
      {t('FileManager.config.showFilesInKnowledgeBase')}
    </Flexbox>
  );
});

export default Config;
