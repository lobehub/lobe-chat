'use client';

import { ActionIcon, DiscordIcon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Book, Github } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DISCORD, DOCUMENTS, GITHUB } from '@/const/url';

const Footer = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('common');

  return (
    <Flexbox align={'center'} horizontal justify={'space-between'} style={{ padding: 16 }}>
      <span style={{ color: theme.colorTextDescription }}>
        © 2023 - {new Date().getFullYear()} LobeHub, LLC
      </span>
      <Flexbox horizontal>
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
      </Flexbox>
    </Flexbox>
  );
});

export default Footer;
