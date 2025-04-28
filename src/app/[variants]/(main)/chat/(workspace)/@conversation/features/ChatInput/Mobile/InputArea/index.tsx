import { ActionIcon, TextArea } from '@lobehub/ui';
import { SafeArea } from '@lobehub/ui/mobile';
import { useSize } from 'ahooks';
import { createStyles } from 'antd-style';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { rgba } from 'polished';
import { CSSProperties, ReactNode, forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import InnerContainer from './Container';

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      flex: none;
      padding-block: 12px 12px;
      border-block-start: 1px solid ${rgba(token.colorBorder, 0.25)};
      background: ${token.colorFillQuaternary};
    `,
    expand: css`
      position: absolute;
      height: 100%;
    `,
    expandButton: css`
      position: absolute;
      inset-inline-start: 14px;
    `,
    expandTextArea: css`
      flex: 1;
    `,
  };
});

export interface MobileChatInputAreaProps {
  bottomAddons?: ReactNode;
  className?: string;
  expand?: boolean;
  loading?: boolean;
  onInput?: (value: string) => void;
  onSend?: () => void;
  safeArea?: boolean;
  setExpand?: (expand: boolean) => void;
  style?: CSSProperties;
  textAreaLeftAddons?: ReactNode;
  textAreaRightAddons?: ReactNode;
  topAddons?: ReactNode;
  value: string;
}

const MobileChatInputArea = forwardRef<TextAreaRef, MobileChatInputAreaProps>(
  (
    {
      className,
      style,
      topAddons,
      textAreaLeftAddons,
      textAreaRightAddons,
      bottomAddons,
      expand = false,
      setExpand,
      onSend,
      onInput,
      loading,
      value,
      safeArea,
    },
    ref,
  ) => {
    const { t } = useTranslation('chat');
    const isChineseInput = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { cx, styles } = useStyles();
    const size = useSize(containerRef);
    const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    useEffect(() => {
      if (!size?.height) return;
      setShowFullscreen(size.height > 72);
    }, [size]);

    const showAddons = !expand && !isFocused;

    return (
      <Flexbox
        className={cx(styles.container, expand && styles.expand, className)}
        gap={12}
        style={style}
      >
        {topAddons && <Flexbox style={showAddons ? {} : { display: 'none' }}>{topAddons}</Flexbox>}
        <Flexbox
          className={cx(expand && styles.expand)}
          ref={containerRef}
          style={{ position: 'relative' }}
        >
          {showFullscreen && (
            <ActionIcon
              active
              className={styles.expandButton}
              icon={expand ? ChevronDown : ChevronUp}
              onClick={() => setExpand?.(!expand)}
              size={{ blockSize: 24, borderRadius: '50%', size: 14 }}
              style={expand ? { top: 6 } : {}}
            />
          )}
          <InnerContainer
            bottomAddons={bottomAddons}
            expand={expand}
            textAreaLeftAddons={textAreaLeftAddons}
            textAreaRightAddons={textAreaRightAddons}
            topAddons={topAddons}
          >
            <TextArea
              autoSize={expand ? false : { maxRows: 6, minRows: 0 }}
              className={cx(expand && styles.expandTextArea)}
              onBlur={(e) => {
                onInput?.(e.target.value);
                setIsFocused(false);
              }}
              onChange={(e) => {
                onInput?.(e.target.value);
              }}
              onCompositionEnd={() => {
                isChineseInput.current = false;
              }}
              onCompositionStart={() => {
                isChineseInput.current = true;
              }}
              onFocus={() => setIsFocused(true)}
              onPressEnter={(e) => {
                if (!loading && !isChineseInput.current && e.shiftKey) {
                  e.preventDefault();
                  onSend?.();
                }
              }}
              placeholder={t('sendPlaceholder')}
              ref={ref}
              style={{ height: 36, paddingBlock: 6 }}
              value={value}
              variant={expand ? 'borderless' : 'filled'}
            />
          </InnerContainer>
        </Flexbox>
        {bottomAddons && (
          <Flexbox style={showAddons ? {} : { display: 'none' }}>{bottomAddons}</Flexbox>
        )}
        {safeArea && !isFocused && <SafeArea position={'bottom'} />}
      </Flexbox>
    );
  },
);

export default MobileChatInputArea;
