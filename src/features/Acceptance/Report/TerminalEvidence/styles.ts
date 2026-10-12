import { createStaticStyles, cssVar } from 'antd-style';

export const styles = createStaticStyles(({ css }) => ({
  /* The collapsed row — same fold dialect as prose evidence: no fill, no
     border, a chevron and one line; the check card is the container. */
  foldHeader: css`
    cursor: pointer;

    display: flex;
    gap: 8px;
    align-items: center;

    width: 100%;
    min-width: 0;
    padding-block: 4px;
    padding-inline: 0;
    border: none;

    text-align: start;

    background: transparent;

    &:hover [data-fold-title] {
      color: ${cssVar.colorText};
    }

    &:focus-visible {
      border-radius: ${cssVar.borderRadiusSM};
      outline: 2px solid ${cssVar.colorPrimaryBorder};
    }

    @media (width <= 767px), (pointer: coarse) {
      min-height: 44px;
    }
  `,
  foldChevron: css`
    flex: none;
    color: ${cssVar.colorTextTertiary};
    transition: transform 160ms ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  foldChevronOpen: css`
    transform: rotate(90deg);
  `,
  foldIcon: css`
    display: flex;
    flex: none;
    color: ${cssVar.colorTextTertiary};
  `,
  foldTitle: css`
    overflow: hidden;
    flex: 1;

    min-width: 0;

    font-family: ${cssVar.fontFamilyCode};
    font-size: 12px;
    line-height: 1.5;
    color: ${cssVar.colorTextSecondary};
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 120ms ease;
  `,
  foldMeta: css`
    display: flex;
    flex: none;
    gap: 6px;
    align-items: center;

    font-size: 12px;
    color: ${cssVar.colorTextTertiary};

    @media (width <= 767px) {
      display: none;
    }
  `,
  /* Small-screen copy of the badges, under the title instead of beside it. */
  foldMetaMobile: css`
    display: none;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;

    padding-inline-start: 22px;

    @media (width <= 767px) {
      display: flex;
    }
  `,
  body: css`
    display: flex;
    flex-direction: column;
    gap: 12px;

    min-width: 0;
    padding-block: 4px 8px;
    padding-inline: 22px 0;

    @media (width <= 767px) {
      padding-inline: 0;
    }
  `,
  description: css`
    padding-inline-start: 22px;
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,

  /* facts */
  command: css`
    display: flex;
    gap: 8px;
    align-items: flex-start;

    padding-block: 8px;
    padding-inline: 12px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadius};

    background: ${cssVar.colorFillQuaternary};
  `,
  commandText: css`
    flex: 1;

    min-width: 0;
    margin: 0;

    font-family: ${cssVar.fontFamilyCode};
    font-size: 12px;
    line-height: 1.6;
    color: ${cssVar.colorText};
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  `,
  commandPrompt: css`
    user-select: none;
    color: ${cssVar.colorTextTertiary};
  `,
  facts: css`
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 6px 16px;

    margin: 0;

    font-size: 12px;
    line-height: 1.6;

    dt {
      color: ${cssVar.colorTextTertiary};
    }

    dd {
      min-width: 0;
      margin: 0;
      color: ${cssVar.colorTextSecondary};
      overflow-wrap: anywhere;
    }

    @media (width <= 767px) {
      grid-template-columns: minmax(0, 1fr);
      gap: 2px;

      dd + dt {
        margin-block-start: 6px;
      }
    }
  `,
  mono: css`
    font-family: ${cssVar.fontFamilyCode};
  `,
  inlineList: css`
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
  `,
  linkButton: css`
    cursor: pointer;

    padding: 0;
    border: none;

    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
    text-decoration: underline;
    text-decoration-color: ${cssVar.colorBorder};
    text-underline-offset: 2px;

    background: none;

    &:hover {
      color: ${cssVar.colorText};
    }
  `,

  /* output */
  toolbar: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  `,
  outputBox: css`
    overflow: auto;

    max-height: 360px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadius};

    background: ${cssVar.colorFillQuaternary};
  `,
  outputGrid: css`
    display: grid;
    grid-template-columns: max-content max-content;

    min-width: 100%;

    font-family: ${cssVar.fontFamilyCode};
    font-size: 12px;
    line-height: 1.6;
  `,
  gutter: css`
    user-select: none;

    position: sticky;
    z-index: 1;
    inset-inline-start: 0;

    margin: 0;
    padding-block: 8px;
    padding-inline: 12px 10px;
    border-inline-end: 1px solid ${cssVar.colorBorderSecondary};

    font: inherit;
    color: ${cssVar.colorTextQuaternary};
    text-align: end;

    background: ${cssVar.colorBgContainer};
  `,
  lines: css`
    margin: 0;
    padding-block: 8px;
    padding-inline: 12px;

    font: inherit;
    color: ${cssVar.colorText};
    white-space: pre;
  `,
  match: css`
    border-radius: 2px;
    color: inherit;
    background: ${cssVar.colorWarningBg};
    box-shadow: 0 0 0 1px ${cssVar.colorWarningBorder};
  `,
  outputState: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;

    min-height: 96px;
    padding: 16px;
    border: 1px dashed ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadius};

    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
    text-align: center;
  `,
  hint: css`
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
}));
