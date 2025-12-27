import { lobeStaticStylish } from '@lobehub/ui';
import { createStyles, cx , responsive } from 'antd-style';

import { WidthMode } from './ShareImage/type';

export const useContainerStyles = createStyles(({ css, cssVar }, widthMode?: WidthMode) => {
  const isNarrow = widthMode === WidthMode.Narrow;

  return {
    preview: cx(
      lobeStaticStylish.noScrollbar,
      css`
        overflow: hidden scroll;

        width: 100%;
        max-width: ${isNarrow ? '480px' : 'none'};
        max-height: 70dvh;
        margin: ${isNarrow ? '0 auto' : '0'};
        border: 1px solid ${cssVar.colorBorder};
        border-radius: ${cssVar.borderRadiusLG};

        background: ${cssVar.colorBgLayout};

        /* stylelint-disable selector-class-pattern */
        .react-pdf__Document *,
        .react-pdf__Page * {
          pointer-events: none;
        }
        /* stylelint-enable selector-class-pattern */

        ::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
        }

        ${responsive.sm} {
          max-height: 40dvh;
        }
      `,
    ),
  };
});
