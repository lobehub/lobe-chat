'use client';

import { ActionIcon, TextArea } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useImageStore } from '@/store/image';
import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

const PromptInput = () => {
  const theme = useTheme();
  const { t } = useTranslation('image');
  const { value, setValue } = useGenerationConfigParam('prompt');
  const createGenerationTopic = useImageStore((s) => s.createGenerationTopic);

  const handleGenerate = async () => {
    const title = await createGenerationTopic([value]);
    console.log('title', title);
  };

  return (
    <Flexbox
      align="center"
      gap={8}
      horizontal
      style={{
        padding: '6px 18px',
        border: `1px solid ${theme.colorBorderSecondary}`,
        borderRadius: theme.borderRadiusLG,
        boxShadow: theme.boxShadow,
        maxWidth: 800,
        backgroundColor: theme.colorBgContainer,
      }}
      width="100%"
    >
      <TextArea
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('config.prompt.placeholder')}
        rows={3}
        style={{ flex: 1, border: 'none', boxShadow: 'none', borderRadius: 0 }}
        value={value}
      />
      <ActionIcon
        icon={Sparkles}
        onClick={handleGenerate}
        size={36}
        style={{
          backgroundColor: theme.colorBgSolid,
        }}
        title="Generate"
      />
    </Flexbox>
  );
};

export default PromptInput;
