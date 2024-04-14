'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Footer = memo(() => {
  const theme = useTheme();

  return (
    <Flexbox align={'center'} horizontal justify={'space-between'} style={{ padding: 16 }}>
      <span style={{ color: theme.colorTextDescription }}>
        ©{new Date().getFullYear()} EDUGPT
      </span>
      {/*<Flexbox horizontal>
        <ActionIcon
          icon={DiscordIcon}
          onClick={() => window.open(DISCORD, '__blank')}
          size={'site'}
          title={'Discord'}
        />
        <ActionIcon
          icon={Book}
          onClick={() => window.open(DOCUMENTS, '__blank')}
          size={'site'}
          title={t('document')}
        />
        <ActionIcon
          icon={Github}
          onClick={() => window.open(GITHUB, '__blank')}
          size={'site'}
          title={'GitHub'}
        />
      </Flexbox>*/}
    </Flexbox>
  );
});

export default Footer;
