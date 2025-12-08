import { MenuRenderProps } from '@lobehub/editor/es/plugins/slash/react/type';
import { useTheme } from 'antd-style';
import { ReactNode, memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MentionListOption } from './types';

/**
 * Get cursor position from browser selection API
 */
const getCursorPosition = (): { x: number; y: number } | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    x: rect.left,
    y: rect.bottom,
  };
};

const MentionDropdown = memo<MenuRenderProps>(
  ({ activeKey, onSelect, open, options, setActiveKey }) => {
    const theme = useTheme();
    const activeItemRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    // Capture cursor position when menu opens
    useLayoutEffect(() => {
      if (open) {
        const pos = getCursorPosition();
        if (pos) {
          setPosition(pos);
        }
      }
    }, [open]);

    useEffect(() => {
      if (activeItemRef.current) {
        activeItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }, [activeKey]);

    if (!open || !options.length || !position) return null;

    return (
      <Flexbox
        style={{
          background: theme.colorBgElevated,
          border: `1px solid ${theme.colorBorderSecondary}`,
          borderRadius: 12,
          boxShadow: theme.boxShadowSecondary,
          left: position.x,
          maxHeight: 260,
          maxWidth: 400,
          minWidth: 150,
          overflow: 'hidden auto',
          position: 'fixed',
          top: position.y,
          zIndex: 9999,
        }}
      >
        {options.map((option) => {
          if ((option as any)?.type === 'divider') {
            return (
              <div
                key={`divider-${(option as any)?.key ?? 'divider'}`}
                style={{ borderTop: `1px solid ${theme.colorBorderSecondary}` }}
              />
            );
          }

          const item = option as MentionListOption;
          const isActive = activeKey === item.key;

          return (
            <Flexbox
              align="center"
              direction="horizontal"
              gap={10}
              key={String(item.key)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect?.(item);
              }}
              onMouseEnter={() => setActiveKey?.(String(item.key))}
              padding={12}
              ref={isActive ? activeItemRef : null}
              style={{
                background: isActive ? theme.colorFillSecondary : undefined,
                cursor: 'pointer',
              }}
            >
              {item.icon && <Flexbox style={{ flex: 'none' }}>{item?.icon as ReactNode}</Flexbox>}
              <Flexbox gap={6} style={{ height: 40, justifyContent: 'center', minWidth: 0 }}>
                <div
                  style={{
                    color: theme.colorText,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </div>
                {item.description && (
                  <div
                    style={{
                      color: theme.colorTextTertiary,
                      fontSize: 12,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.description}
                  </div>
                )}
              </Flexbox>
            </Flexbox>
          );
        })}
      </Flexbox>
    );
  },
);

MentionDropdown.displayName = 'MentionDropdown';

export default MentionDropdown;
