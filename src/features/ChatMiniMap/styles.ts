import { createStyles } from 'antd-style';

export const useMinimapStyles = createStyles(({ css, token }) => ({
  arrow: css`
    opacity: 0;
    transition: opacity ${token.motionDurationMid} ease;

    &:hover {
      color: ${token.colorText};
      background: ${token.colorFill};
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
    }
  `,
  arrowVisible: css`
    opacity: 1;
  `,
  container: css`
    pointer-events: none;

    position: absolute;
    z-index: 1;
    inset-block: 16px 120px;
    inset-inline-end: 8px;

    width: 32px;
  `,
  rail: css`
    pointer-events: auto;

    display: flex;
    flex-direction: column;
    gap: 0;
    align-items: end;
    justify-content: space-between;

    width: 100%;
    height: fit-content;
    margin-block: 0;
    margin-inline: auto;

    &:hover .arrow {
      opacity: 1;
    }
  `,
  railContent: css`
    scrollbar-width: none;

    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    align-items: end;
    justify-content: space-between;

    max-height: 50vh;

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }
  `,
}));

export const useIndicatorStyles = createStyles(({ css, token }) => ({
  indicator: css`
    flex-shrink: 0;

    min-width: 12px;
    height: 12px;
    padding-block: 5px;
    padding-inline: 4px;
  `,
  indicatorActive: css`
    transform: scaleX(1.1);
    background: ${token.colorPrimary};
    box-shadow: 0 0 0 1px ${token.colorPrimaryHover};
  `,
  indicatorContent: css`
    width: 100%;
    height: 100%;
    border-radius: 3px;
    background: ${token.colorFillSecondary};
  `,
  indicatorContentActive: css`
    background: ${token.colorPrimary};
  `,
}));
