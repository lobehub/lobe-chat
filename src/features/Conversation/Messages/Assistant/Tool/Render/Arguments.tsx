import { Highlighter, copyToClipboard } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { parse } from 'partial-json';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useYamlArguments } from '@/hooks/useYamlArguments';
import { shinyTextStylish } from '@/styles/loading';

const useStyles = createStyles(({ css, token }) => ({
  arrayRow: css`
    &:not(:first-child) {
      border-block-start: 1px dotted ${token.colorBorderSecondary};
    }
  `,
  colon: css`
    color: ${token.colorTextTertiary};
  `,
  container: css`
    padding-block: 4px;
    padding-inline: 12px;
    border-radius: ${token.borderRadiusLG}px;

    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    line-height: 1.5;

    background: ${token.colorFillQuaternary};
  `,
  copyable: css`
    cursor: pointer;
    width: 100%;
    margin-block: 2px;
    padding: 4px;

    &:hover {
      border-radius: 6px;
      background: ${token.colorFillTertiary};
    }
  `,
  key: css`
    color: ${token.colorTextTertiary};
  `,
  row: css`
    display: flex;
    align-items: baseline;

    &:not(:first-child) {
      border-block-start: 1px dotted ${token.colorBorderSecondary};
    }
  `,
  shineText: shinyTextStylish(token),
  value: css`
    color: ${token.colorTextSecondary};
  `,
}));

interface ObjectDisplayProps {
  data: Record<string, any>;
  shine?: boolean;
}

const ObjectDisplay = memo(({ data, shine }: ObjectDisplayProps) => {
  const { styles, cx } = useStyles();
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

  const hasMinWidth = Object.keys(data).length > 1;
  if (Object.keys(data).length === 0) return null;

  return (
    <div className={styles.container}>
      {Object.entries(data).map(([key, value]) => {
        const formatedValue = formatValue(value);
        return (
          <div className={styles.row} key={key}>
            <span
              className={styles.key}
              style={{ minWidth: hasMinWidth ? (isMobile ? 60 : 140) : undefined }}
            >
              {key}
            </span>
            <span className={styles.colon}>:</span>
            <div className={cx(shine ? styles.shineText : styles.value)} style={{ width: '100%' }}>
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
  shine?: boolean;
}

const Arguments = memo<ArgumentsProps>(({ arguments: args = '', shine }) => {
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
    <ObjectDisplay data={requestArgs} shine={shine} />
  );
});

export default Arguments;
