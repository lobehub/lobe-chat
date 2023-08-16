import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, cx }) => {
  const hover = css`
    &:hover {
      border-color: ${token.colorText};
      box-shadow: 0 0 0 2px ${token.colorText};
    }
  `;

  const img = cx(css`
    box-shadow: inset 0 0 0 2px ${token.colorSplit};
    transition: all 100ms ${token.motionEaseOut};
    border-radius: ${token.borderRadius}px;

    ${hover}
  `);

  return {
    active: css`
      color: ${token.colorText};
    `,
    container: css`
      cursor: pointer;
      color: ${token.colorTextDescription};
    `,
    img,
    imgActive: css`
      box-shadow: 0 0 0 2px ${token.colorTextTertiary};

      .${img} {
        box-shadow: none;
      }
    `,
    imgCtn: css`
      background: ${token.colorFillTertiary};
      border-radius: ${token.borderRadius}px;

      ${hover}
    `,
  };
});
