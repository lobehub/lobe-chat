import { GridBackground, Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Loader2 } from 'lucide-react';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const Loading = memo(() => {
  const { t } = useTranslation('common');

  const theme = useTheme();

  return (
    <Flexbox height={'100vh'} width={'100%'}>
      <GridBackground
        animation
        colorBack={rgba(theme.colorText, 0.12)}
        colorFront={rgba(theme.colorText, 0.4)}
        flip
      />
      <Center flex={1} gap={12} width={'100%'}>
        <Icon icon={Loader2} size={{ fontSize: 64 }} spin />
        {t('appInitializing')}
      </Center>
      <GridBackground
        animation
        colorBack={rgba(theme.colorText, 0.12)}
        colorFront={rgba(theme.colorText, 0.4)}
      />
    </Flexbox>
  );
});

export default Loading;
