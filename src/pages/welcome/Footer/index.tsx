import { ActionIcon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Book, Github } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Discord from '@/components/DiscordIcon';
import { CHANGELOG, DISCORD, GITHUB } from '@/const/url';

const Footer = memo(() => {
  const theme = useTheme();

  return (
    <Flexbox align={'center'} horizontal justify={'space-between'} style={{ padding: 16 }}>
      <span style={{ color: theme.colorTextDescription }}>©{new Date().getFullYear()} LobeHub</span>
      <Flexbox horizontal>
        <ActionIcon icon={Discord} onClick={() => window.open(DISCORD, '__blank')} size={'site'} />
        <ActionIcon icon={Book} onClick={() => window.open(CHANGELOG, '__blank')} size={'site'} />
        <ActionIcon icon={Github} onClick={() => window.open(GITHUB, '__blank')} size={'site'} />
      </Flexbox>
    </Flexbox>
  );
});

export default Footer;
