'use client';

import { Icon, Text } from '@lobehub/ui';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

const PromptTitle = () => {
  const { t } = useTranslation('image');

  return (
    <Center gap={16} horizontal style={{ width: '100%' }}>
      <Icon icon={Palette} size={28} />
      <Text
        as={'h2'}
        style={{
          margin: 0,
        }}
      >
        {t('config.title')}
      </Text>
    </Center>
  );
};

export default PromptTitle;
