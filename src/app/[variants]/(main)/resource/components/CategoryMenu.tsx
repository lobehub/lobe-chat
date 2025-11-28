'use client';

import { CaretDownFilled } from '@ant-design/icons';
import { ActionIcon, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { motion } from 'framer-motion';
import { FileText, ImageIcon, Mic2, SquarePlay } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import Menu from '@/components/Menu';
import type { MenuProps } from '@/components/Menu';
import { FilesTabs } from '@/types/files';

import { useFileCategory } from '../hooks/useFileCategory';
import { useResourceManagerStore } from '../store';

const useStyles = createStyles(({ css, token }) => ({
  header: css`
    cursor: pointer;
    border-radius: ${token.borderRadius}px;
    color: ${token.colorTextSecondary};
    transition: background-color 0.2s;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }
  `,
  headerActive: css`
    color: ${token.colorText};
    background-color: ${token.colorFillSecondary};
  `,
  indentedMenu: css`
    padding-inline-start: 24px;
  `,
}));

const CategoryMenu = memo(() => {
  const { t } = useTranslation('file');
  const { styles, cx } = useStyles();
  const [activeKey] = useFileCategory();
  const [showCollapsed, setShowCollapsed] = useState(activeKey !== FilesTabs.All);
  const navigate = useNavigate();

  const setMode = useResourceManagerStore((s) => s.setMode);

  const collapsedItems: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={FileText} />,
        key: FilesTabs.Documents,
        label: t('tab.documents'),
      },
      {
        icon: <Icon icon={ImageIcon} />,
        key: FilesTabs.Images,
        label: t('tab.images'),
      },
      {
        icon: <Icon icon={Mic2} />,
        key: FilesTabs.Audios,
        label: t('tab.audios'),
      },
      {
        icon: <Icon icon={SquarePlay} />,
        key: FilesTabs.Videos,
        label: t('tab.videos'),
      },
      // {
      //   icon: <Icon icon={Globe} />,
      //   key: FilesTabs.Websites,
      //   label: t('tab.websites'),
      // },
    ],
    [t],
  );

  const isHomeActive = activeKey === FilesTabs.All;

  return (
    <Flexbox gap={4}>
      <Flexbox
        align={'center'}
        className={cx(styles.header, isHomeActive && styles.headerActive)}
        horizontal
        onClick={() => {
          navigate('/resource', { replace: true });
          setMode('files');
        }}
        paddingBlock={6}
        paddingInline={8}
      >
        <Flexbox align={'center'} flex={1} gap={8} horizontal>
          <motion.div
            animate={{ rotate: showCollapsed ? 0 : -90 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ActionIcon
              icon={CaretDownFilled as any}
              onClick={(e) => {
                e.stopPropagation();
                setShowCollapsed(!showCollapsed);
              }}
              size={'small'}
            />
          </motion.div>
          <div style={{ flex: 1, lineHeight: '14px' }}>{t('tab.all')}</div>
        </Flexbox>
      </Flexbox>

      <motion.div
        animate={{
          height: showCollapsed ? 'auto' : 0,
          opacity: showCollapsed ? 1 : 0,
        }}
        initial={false}
        style={{ overflow: 'hidden' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Flexbox>
          <Menu
            compact
            items={collapsedItems}
            onClick={({ key }) => {
              const categoryParam = key === FilesTabs.All ? '' : `?category=${key}`;

              setMode('files');

              navigate(`/resource${categoryParam}`, { replace: true });
            }}
            selectable
            selectedKeys={[activeKey]}
          />
        </Flexbox>
      </motion.div>
    </Flexbox>
  );
});

CategoryMenu.displayName = 'CategoryMenu';

export default CategoryMenu;
