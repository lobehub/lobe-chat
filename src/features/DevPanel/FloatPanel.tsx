import { ActionIcon, Icon } from '@lobehub/ui';
import { useLocalStorageState } from 'ahooks';
import { FloatButton } from 'antd';
import { createStyles } from 'antd-style';
import { BugIcon, BugOff, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Rnd } from 'react-rnd';

// 定义样式
const useStyles = createStyles(({ token, css }) => {
  return {
    collapsed: css`
      pointer-events: none;
      transform: scale(0.8);
      opacity: 0;
    `,
    content: css`
      overflow: auto;
      flex: 1;
      padding: ${token.padding}px;
      color: ${token.colorText};

      &::-webkit-scrollbar {
        width: ${token.controlHeightSM / 2}px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: ${token.borderRadiusXS}px;
        background: ${token.colorFillSecondary};

        &:hover {
          background: ${token.colorFillTertiary};
        }
      }
    `,
    expanded: css`
      pointer-events: auto;
      transform: scale(1);
      opacity: 1;
    `,
    header: css`
      cursor: move;
      user-select: none;

      padding-block: 12px;
      padding-inline: 16px;
      border-block-end: 1px solid ${token.colorBorderSecondary};
      border-start-start-radius: 12px;
      border-start-end-radius: 12px;

      font-weight: ${token.fontWeightStrong};
      color: ${token.colorText};

      background: ${token.colorFillAlter};
    `,
    panel: css`
      position: fixed;
      z-index: 1000;

      display: flex;

      border-radius: 12px;

      background: ${token.colorBgContainer};
      box-shadow: ${token.boxShadow};

      transition:
        transform 80ms linear,
        opacity ${token.motionDurationMid} ${token.motionEaseInOut};
    `,
  };
});

const CollapsibleFloatPanel = ({
  children = 'content',
  defaultPosition = { x: 400, y: 200 },
  defaultSize = { height: 600, width: 800 },
  minWidth = 800,
  minHeight = 600,
}) => {
  const { styles } = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useLocalStorageState('debug-panel-position', {
    defaultValue: defaultPosition,
  });
  const [size, setSize] = useState(defaultSize);

  return (
    <>
      <FloatButton
        icon={<Icon icon={isExpanded ? BugOff : BugIcon} />}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ bottom: 24, right: 24 }}
      />
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
        <Flexbox>
          <Flexbox
            align={'center'}
            className={`panel-drag-handle ${styles.header}`}
            horizontal
            justify={'space-between'}
          >
            开发者面板
            <ActionIcon icon={XIcon} onClick={() => setIsExpanded(false)} />
          </Flexbox>
          <div className={styles.content}>{children}</div>
        </Flexbox>
      </Rnd>
    </>
  );
};

export default CollapsibleFloatPanel;
