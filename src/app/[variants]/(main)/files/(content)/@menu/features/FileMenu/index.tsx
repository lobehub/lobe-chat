'use client';

import { Icon } from '@lobehub/ui';
import { FileText, Globe, ImageIcon, LayoutGrid, Mic2, SquarePlay } from 'lucide-react';
import Link from 'next/link';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useFileCategory } from '@/app/[variants]/(main)/files/hooks/useFileCategory';
import Menu from '@/components/Menu';
import type { MenuProps } from '@/components/Menu';
import { FilesTabs } from '@/types/files';

const FileMenu = memo(() => {
  const { t } = useTranslation('file');
  const [activeKey, setActiveKey] = useFileCategory();

  const items: MenuProps['items'] = useMemo(
    () =>
      [
        {
          icon: <Icon icon={LayoutGrid} />,
          key: FilesTabs.All,
          label: (
            <Link href={'/files'} onClick={(e) => e.preventDefault()}>
              {t('tab.all')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={FileText} />,
          key: FilesTabs.Documents,
          label: (
            <Link href={'/files?category=documents'} onClick={(e) => e.preventDefault()}>
              {t('tab.documents')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={ImageIcon} />,
          key: FilesTabs.Images,
          label: (
            <Link href={'/files?category=images'} onClick={(e) => e.preventDefault()}>
              {t('tab.images')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={Mic2} />,
          key: FilesTabs.Audios,
          label: (
            <Link href={'/files?category=audios'} onClick={(e) => e.preventDefault()}>
              {t('tab.audios')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={SquarePlay} />,
          key: FilesTabs.Videos,
          label: (
            <Link href={'/files?category=videos'} onClick={(e) => e.preventDefault()}>
              {t('tab.videos')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={Globe} />,
          key: FilesTabs.Websites,
          label: (
            <Link href={'/files?category=websites'} onClick={(e) => e.preventDefault()}>
              {t('tab.websites')}
            </Link>
          ),
        },
      ]
        .filter(Boolean)
        .slice(0, 5) as MenuProps['items'],
    [t],
  );

  return (
    <Flexbox>
      <Menu
        compact
        items={items}
        onClick={({ key }) => {
          setActiveKey(key);
        }}
        selectable
        selectedKeys={[activeKey]}
      />
    </Flexbox>
  );
});

export default FileMenu;
