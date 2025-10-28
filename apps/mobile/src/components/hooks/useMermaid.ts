// @ts-ignore
import type { MermaidConfig } from 'mermaid/dist/config.type';
import { useMemo } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { Md5 } from 'ts-md5';

import { useTheme, useThemeMode } from '../styles';

// 缓存已验证的图表内容
const MD5_LENGTH_THRESHOLD = 10_000;

/**
 * 验证并处理 Mermaid 图表内容
 */
export const useMermaid = (
  content: string,
  {
    id,
    theme: customTheme,
  }: {
    id: string;
    theme?: MermaidConfig['theme'];
  },
): SWRResponse<string, Error> => {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  // 提取主题相关配置到 useMemo 中
  const mermaidConfig: MermaidConfig = useMemo(
    () => ({
      fontFamily: theme.fontFamilyCode,
      gantt: {
        useWidth: 1920,
      },
      securityLevel: 'loose',
      startOnLoad: true,
      theme: customTheme || (isDarkMode ? 'dark' : 'neutral'),
      themeVariables: customTheme
        ? undefined
        : {
            errorBkgColor: theme.colorTextDescription,
            errorTextColor: theme.colorTextDescription,
            fontFamily: theme.fontFamily,
            lineColor: theme.colorTextSecondary,
            mainBkg: theme.colorBgContainer,
            noteBkgColor: theme.colorInfoBg,
            noteTextColor: theme.colorInfoText,
            pie1: theme.geekblue,
            pie2: theme.colorWarning,
            pie3: theme.colorSuccess,
            pie4: theme.colorError,
            primaryBorderColor: theme.colorBorder,
            primaryColor: theme.colorBgContainer,
            primaryTextColor: theme.colorText,
            secondaryBorderColor: theme.colorInfoBorder,
            secondaryColor: theme.colorInfoBg,
            secondaryTextColor: theme.colorInfoText,
            tertiaryBorderColor: theme.colorSuccessBorder,
            tertiaryColor: theme.colorSuccessBg,
            tertiaryTextColor: theme.colorSuccessText,
            textColor: theme.colorText,
          },
    }),
    [isDarkMode, customTheme],
  );

  // 为长内容生成哈希键
  const cacheKey = useMemo((): string => {
    const hash = content.length < MD5_LENGTH_THRESHOLD ? content : Md5.hashStr(content);
    return [id, customTheme || (isDarkMode ? 'd' : 'l'), hash].filter(Boolean).join('-');
  }, [content, id, isDarkMode, customTheme]);

  return useSWR(
    cacheKey,
    (): string => {
      const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://registry.npmmirror.com/mermaid/11.12.1/files/dist/mermaid.min.js"></script>
        <style>
          * { margin: 0; padding: 0; }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 400px;
            background: transparent;
            overflow: hidden;
            pointer-events: none;
          }
          .mermaid {
            width: 100%;
            height: 400px;
            display: flex;
            justify-content: center;
          }
          .mermaid svg {
            width: 100%;
            height: 200px;
          }
        </style>
      </head>
      <body>
        <div id="mermaid-container">
          <div class="mermaid">
            ${content}
          </div>
        </div>
        <script>
          mermaid.initialize({
          ...${JSON.stringify(mermaidConfig)}
          });
        </script>
      </body>
    </html>
  `;
      return html;
    },
    {
      dedupingInterval: 3000,
      errorRetryCount: 2,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
