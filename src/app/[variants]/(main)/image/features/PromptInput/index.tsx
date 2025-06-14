'use client';

import { ActionIcon, TextArea } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useImageStore } from '@/store/image';
import { createImageSelectors } from '@/store/image/selectors';
import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

const PromptInput = () => {
  const theme = useTheme();
  const { t } = useTranslation('image');
  const { value, setValue } = useGenerationConfigParam('prompt');
  const isCreating = useImageStore(createImageSelectors.isCreating);
  const createImage = useImageStore((s) => s.createImage);

  const handleGenerate = async () => {
    await createImage();
  };

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.8 }}
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      transition={{
        duration: 0.5,
        ease: [0.175, 0.885, 0.32, 1.275],
        type: 'spring',
        damping: 15,
        stiffness: 300,
      }}
    >
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
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ActionIcon
            icon={Sparkles}
            loading={isCreating}
            onClick={handleGenerate}
            size={36}
            style={{
              backgroundColor: theme.colorBgSolid,
            }}
            title="Generate"
          />
        </motion.div>
      </Flexbox>
    </motion.div>
  );
};

export default PromptInput;
