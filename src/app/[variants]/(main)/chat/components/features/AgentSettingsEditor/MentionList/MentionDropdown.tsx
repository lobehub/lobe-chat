import { MenuRenderProps } from '@lobehub/editor/es/plugins/slash/react/type';
import { useTheme } from 'antd-style';
import { memo, ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MentionListOption } from './types';

const MentionDropdown = memo<MenuRenderProps>(
  ({ activeKey, onSelect, options, setActiveKey }) => {
    const theme = useTheme();

    if (!options.length) return null;

    return (
      <Flexbox
        style={{
          background: theme.colorBgElevated,
          border: `1px solid ${theme.colorBorderSecondary}`,
          borderRadius: 12,
          boxShadow: theme.boxShadowSecondary,
          maxHeight: 260,
          minWidth: 280,
          overflow: 'hidden auto',
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
              style={{
                background: isActive ? theme.colorFillSecondary : undefined,
                cursor: 'pointer',
              }}
            >
              {item.icon && <Flexbox style={{ flex: 'none' }}>{item?.icon as ReactNode}</Flexbox>}
              <Flexbox gap={6} style={{ minWidth: 0 }}>
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
