'use client';

import { ActionIcon, FluentEmoji, Icon, SideNav } from '@lobehub/ui';
import { Dropdown, FloatButton } from 'antd';
import { createStyles } from 'antd-style';
import { BugIcon, BugOff, XIcon } from 'lucide-react';
import { ReactNode, memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Rnd } from 'react-rnd';

import { BRANDING_NAME } from '@/const/branding';

// 定义样式
const useStyles = createStyles(({ token, css, prefixCls }) => {
  return {
    collapsed: css`
      pointer-events: none;
      transform: scale(0.8);
      opacity: 0;
    `,
    expanded: css`
      pointer-events: auto;
      transform: scale(1);
      opacity: 1;
    `,
    floatButton: css`
      inset-block-end: 16px;
      inset-inline-end: 16px;

      width: 36px;
      height: 36px;
      border: 1px solid ${token.colorBorderSecondary};

      font-size: 20px;
      .${prefixCls}-float-btn-body {
        background: ${token.colorBgLayout};

        &:hover {
          width: auto;
          background: ${token.colorBgElevated};
        }
      }
    `,
    header: css`
      cursor: move;
      user-select: none;

      padding-block: 8px;
      padding-inline: 16px;
      border-block-end: 1px solid ${token.colorBorderSecondary};

      color: ${token.colorText};

      background: ${token.colorFillAlter};
    `,
    panel: css`
      position: fixed;
      z-index: 1000;

      overflow: hidden;
      display: flex;

      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 12px;

      background: ${token.colorBgContainer};
      box-shadow: ${token.boxShadow};

      transition: opacity ${token.motionDurationMid} ${token.motionEaseInOut};
    `,
  };
});

const minWidth = 800;
const minHeight = 600;

interface CollapsibleFloatPanelProps {
  items: { children: ReactNode; icon: ReactNode; key: string }[];
}

const CollapsibleFloatPanel = memo<CollapsibleFloatPanelProps>(({ items }) => {
  const { styles, theme } = useStyles();
  const [tab, setTab] = useState<string>(items[0].key);
  const [isHide, setIsHide] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ height: minHeight, width: minWidth });

  useEffect(() => {
    try {
      const localStoragePosition = localStorage.getItem('debug-panel-position');
      if (localStoragePosition && JSON.parse(localStoragePosition)) {
        setPosition(JSON.parse(localStoragePosition));
      }
    } catch {
      /* empty */
    }

    try {
      const localStorageSize = localStorage.getItem('debug-panel-size');
      if (localStorageSize && JSON.parse(localStorageSize)) {
        setSize(JSON.parse(localStorageSize));
      }
    } catch {
      /* empty */
    }
  }, []);

  return (
    <>
      {!isHide && (
        <Dropdown
          menu={{
            items: [
              {
                icon: (
                  <Icon color={theme.colorTextSecondary} icon={BugOff} size={{ fontSize: 16 }} />
                ),
                key: 'hide',
                label: 'Hide Toolbar',
                onClick: () => setIsHide(true),
              },
            ],
          }}
          trigger={['hover']}
        >
          <FloatButton
            className={styles.floatButton}
            icon={<Icon icon={isExpanded ? BugOff : BugIcon} />}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </Dropdown>
      )}
      {isExpanded && (
        <Rnd
          bounds="window"
          className={`${styles.panel} ${isExpanded ? styles.expanded : styles.collapsed}`}
          dragHandleClassName="panel-drag-handle"
          minHeight={minHeight}
          minWidth={minWidth}
          onDragStop={(e, d) => {
            setPosition({ x: d.x, y: d.y });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            setSize({
              height: Number(ref.style.height),
              width: Number(ref.style.width),
            });
            setPosition(position);
          }}
          position={position}
          size={size}
        >
          <Flexbox
            height={'100%'}
            horizontal
            style={{ overflow: 'hidden', position: 'relative' }}
            width={'100%'}
          >
            <SideNav
              avatar={<FluentEmoji emoji={'🧰'} size={24} />}
              bottomActions={[]}
              style={{
                paddingBlock: 12,
                width: 48,
              }}
              topActions={items.map((item) => (
                <ActionIcon
                  active={tab === item.key}
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  placement={'right'}
                  title={item.key}
                >
                  {item.icon}
                </ActionIcon>
              ))}
            />
            <Flexbox
              height={'100%'}
              style={{ overflow: 'hidden', position: 'relative' }}
              width={'100%'}
            >
              <Flexbox
                align={'center'}
                className={`panel-drag-handle ${styles.header}`}
                horizontal
                justify={'space-between'}
              >
                <Flexbox align={'baseline'} gap={6} horizontal>
                  <b>{BRANDING_NAME} Dev Tools</b>
                  <span style={{ color: theme.colorTextDescription }}>/</span>
                  <span style={{ color: theme.colorTextDescription }}>{tab}</span>
                </Flexbox>
                <ActionIcon icon={XIcon} onClick={() => setIsExpanded(false)} />
              </Flexbox>
              {items.map((item) => (
                <Flexbox
                  flex={1}
                  height={'100%'}
                  key={item.key}
                  style={{
                    display: tab === item.key ? 'flex' : 'none',
                    overflow: 'hidden',
                  }}
                >
                  {item.children}
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        </Rnd>
      )}
    </>
  );
});

export default CollapsibleFloatPanel;
