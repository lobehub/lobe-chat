'use client';

import { TextArea } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
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
        gap={12}
        horizontal
        style={{
          padding: '8px 12px 8px 20px',
          border: `1px solid ${theme.colorBorderSecondary}`,
          borderRadius: theme.borderRadiusLG,
          boxShadow: `0 2px 8px ${theme.colorFillSecondary}`,
          maxWidth: 1000,
          backgroundColor: theme.colorBgElevated,
          width: '100%',
        }}
      >
        <TextArea
          className="resize-textarea"
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('config.prompt.placeholder')}
          resize
          rows={3}
          style={{
            flex: 1,
            border: 'none',
            boxShadow: 'none',
            borderRadius: 0,
            backgroundColor: 'transparent',
            fontSize: theme.fontSizeLG,
            lineHeight: 1.6,
            padding: '8px 0',
          }}
          value={value}
        />
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.button
            disabled={isCreating || !value.trim()}
            onClick={handleGenerate}
            style={{
              background: theme.isDarkMode ? '#ffffff' : theme.colorPrimary,
              border: 'none',
              borderRadius: theme.borderRadius,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: isCreating || !value.trim() ? 'not-allowed' : 'pointer',
              fontSize: theme.fontSize,
              fontWeight: 600,
              color: theme.isDarkMode ? '#000000' : '#ffffff',
              transition: 'all 0.2s ease',
              minHeight: 60,
              opacity: isCreating || !value.trim() ? 0.6 : 1,
              boxShadow: theme.isDarkMode
                ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                : '0 2px 4px rgba(0, 0, 0, 0.15)',
            }}
            whileHover={
              !isCreating && value.trim()
                ? {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.isDarkMode
                      ? '0 4px 8px rgba(0, 0, 0, 0.15)'
                      : '0 4px 8px rgba(0, 0, 0, 0.2)',
                  }
                : {}
            }
          >
            <motion.div
              animate={isCreating ? {} : { rotate: 0 }}
              transition={{
                duration: 1,
                repeat: 0,
                ease: 'linear',
              }}
            >
              {isCreating ? <Loader2 size={18} /> : <Sparkles size={18} />}
            </motion.div>
            <span>{isCreating ? 'Generating...' : 'Generate'}</span>
          </motion.button>
        </motion.div>
      </Flexbox>
    </motion.div>
  );
};

export default PromptInput;
