import { createStaticStyles, cx, keyframes } from 'antd-style';
import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from 'react';

// Scroll speed of the hover marquee, in px per second.
const SCROLL_SPEED = 40;
// Share of one loop spent on each of the three holds (tail, head, tail), so
// both ends stay readable.
const HOLD_RATIO = 0.2;
const MIN_DURATION = 3;

const HOLD = HOLD_RATIO * 100;

// Hold at the tail, scroll to the head, hold, scroll back.
const scrollToHead = keyframes`
  0%,
  ${HOLD}% {
    transform: translateX(0);
  }

  ${50 - HOLD / 2}%,
  ${50 + HOLD / 2}% {
    transform: translateX(var(--tail-marquee-offset));
  }

  ${100 - HOLD}%,
  100% {
    transform: translateX(0);
  }
`;

const styles = createStaticStyles(({ css }) => ({
  container: css`
    overflow: hidden;
    display: flex;
    flex: 1;
    justify-content: flex-end;

    min-width: 0;
  `,
  overflowing: css`
    mask-image: linear-gradient(to right, transparent, #000 16px);

    &:hover {
      mask-image: none;
    }

    &:hover > span {
      animation: ${scrollToHead} var(--tail-marquee-duration) ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      &:hover > span {
        animation: none;
      }
    }
  `,
  content: css`
    flex: none;
    white-space: nowrap;
  `,
}));

interface TailMarqueeProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Single-line text that keeps its tail visible when it overflows (paths read
 * from the end), and scrolls back to the head on hover to reveal the rest.
 */
const TailMarquee = ({ children, className, style }: TailMarqueeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => setOverflow(Math.max(0, content.offsetWidth - container.clientWidth));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const duration = Math.max(MIN_DURATION, (overflow * 2) / SCROLL_SPEED / (1 - HOLD_RATIO * 3));

  return (
    <div
      className={cx(styles.container, overflow > 0 && styles.overflowing, className)}
      ref={containerRef}
      style={
        {
          ...style,
          '--tail-marquee-duration': `${duration}s`,
          '--tail-marquee-offset': `${overflow}px`,
        } as CSSProperties
      }
    >
      <span className={styles.content} ref={contentRef}>
        {children}
      </span>
    </div>
  );
};

export default TailMarquee;
