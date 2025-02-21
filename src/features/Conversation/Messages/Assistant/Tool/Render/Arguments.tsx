import { Highlighter, copyToClipboard } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { parse } from 'partial-json';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useYamlArguments } from '@/hooks/useYamlArguments';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  arrayRow: css`
    &:not(:first-child) {
      border-top: 1px dotted ${token.colorBorderSecondary};
    }
  `,
  colon: css`
    color: ${token.colorTextTertiary};
  `,
  container: css`
    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    line-height: 1.5;
    background: ${isDarkMode ? token.colorFillTertiary : token.colorFillQuaternary};
    border-radius: ${token.borderRadiusLG}px;
    padding: 4px 12px;
  `,
  copyable: css`
    cursor: pointer;
    padding: 4px;
    margin-block: 2px;
    width: 100%;

    &:hover {
      background: ${token.colorFillTertiary};
      border-radius: 6px;
    }
  `,
  key: css`
    color: ${token.colorTextTertiary};
  `,
  row: css`
    display: flex;
    align-items: baseline;

    &:not(:first-child) {
      border-top: 1px dotted ${token.colorBorderSecondary};
    }
  `,
  value: css`
    color: ${token.colorTextSecondary};
    width: 100%;
  `,
}));

interface ObjectDisplayProps {
  data: Record<string, any>;
}

const ObjectDisplay = memo(({ data }: ObjectDisplayProps) => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');

  const { message } = App.useApp();
  const isMobile = useIsMobile();

  const formatValue = (value: any): string | string[] => {
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : v));
    }

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(', ');
    }
    return String(value);
  };

  const hasMinWidth = Object.keys(data).length > 1 && !isMobile;
  return (
    <div className={styles.container}>
      {Object.entries(data).map(([key, value]) => {
        const formatedValue = formatValue(value);
        return (
          <div className={styles.row} key={key}>
            <span className={styles.key} style={{ minWidth: hasMinWidth ? 80 : undefined }}>
              {key}
            </span>
            <span className={styles.colon}>:</span>
            <div className={styles.value}>
              {typeof formatedValue === 'string' ? (
                <div
                  className={styles.copyable}
                  onClick={async () => {
                    await copyToClipboard(formatedValue);
                    message.success(t('copySuccess'));
                  }}
                >
                  {formatedValue}
                </div>
              ) : (
                formatedValue.map((v, i) => (
                  <div
                    className={styles.arrayRow}
                    key={i}
                    onClick={async () => {
                      await copyToClipboard(v);
                      message.success(t('copySuccess'));
                    }}
                  >
                    <div className={styles.copyable}>{v}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export interface ArgumentsProps {
  arguments?: string;
}

const Arguments = memo<ArgumentsProps>(({ arguments: args = '' }) => {
  const requestArgs = useMemo(() => {
    try {
      const obj = parse(args);

      if (Object.keys(obj).length === 0) return {};

      return obj;
    } catch {
      return args;
    }
  }, [args]);

  const yaml = useYamlArguments(args);

  return typeof requestArgs === 'string' ? (
    !!yaml && (
      <Highlighter language={'yaml'} showLanguage={false}>
        {yaml}
      </Highlighter>
    )
  ) : (
    <ObjectDisplay data={requestArgs} />
  );
});

export default Arguments;
