import { createStaticStyles, cssVar } from 'antd-style';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Loading from '@/components/Loading/CircleLoading';

import { classifySheet } from './classifySheet';
import { MAX_PREVIEW_ROWS, readWorkbook, type SheetModel } from './model';
import SheetDocument from './SheetDocument';
import SheetGrid from './SheetGrid';

const styles = createStaticStyles(({ css }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${cssVar.colorBgContainer};
  `,
  footer: css`
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    padding-block: 6px;
    padding-inline: 8px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
  modes: css`
    display: flex;
    flex: none;
    gap: 4px;
  `,
  tab: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 12px;
    border: none;
    border-radius: 6px;

    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
    white-space: nowrap;

    background: transparent;

    &:hover {
      background: ${cssVar.colorFillTertiary};
    }

    &[data-active='true'] {
      font-weight: 500;
      color: ${cssVar.colorText};
      background: ${cssVar.colorFillSecondary};
    }
  `,
  tabs: css`
    overflow-x: auto;
    display: flex;
    gap: 4px;
  `,
  truncatedNote: css`
    flex: none;

    padding-block: 6px;
    padding-inline: 12px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
}));

interface XlsxPaneProps {
  blob: Blob;
  onError: (error: unknown) => void;
}

const XlsxPane = memo<XlsxPaneProps>(({ blob, onError }) => {
  const { t } = useTranslation('chat');
  const [sheets, setSheets] = useState<SheetModel[]>();
  const [activeSheet, setActiveSheet] = useState(0);
  const [mode, setMode] = useState<'auto' | 'fidelity' | 'reflow'>('auto');

  useEffect(() => {
    let disposed = false;

    readWorkbook(blob)
      .then((parsed) => {
        if (disposed) return;
        setSheets(parsed);
        setActiveSheet(0);
        setMode('auto');
      })
      .catch((error) => {
        if (!disposed) onError(error);
      });

    return () => {
      disposed = true;
    };
  }, [blob, onError]);

  const sheet = sheets?.[activeSheet] ?? sheets?.[0];
  const outline = useMemo(() => (sheet ? classifySheet(sheet) : undefined), [sheet]);

  if (!sheet || !outline) return <Loading />;

  const resolvedMode = mode === 'auto' ? outline.mode : mode;

  return (
    <div className={styles.container}>
      {resolvedMode === 'reflow' ? (
        <SheetDocument outline={outline} />
      ) : (
        <SheetGrid sheet={sheet} />
      )}
      {sheet.truncated && (
        <div className={styles.truncatedNote}>
          {t('workingPanel.localFile.document.truncatedRows', { count: MAX_PREVIEW_ROWS })}
        </div>
      )}
      <div className={styles.footer}>
        <div className={styles.tabs}>
          {sheets!.map((item, index) => (
            <button
              className={styles.tab}
              data-active={index === activeSheet}
              key={`${index}-${item.name}`}
              type={'button'}
              onClick={() => setActiveSheet(index)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className={styles.modes}>
          <button
            className={styles.tab}
            data-active={resolvedMode === 'reflow'}
            type={'button'}
            onClick={() => setMode('reflow')}
          >
            {t('workingPanel.localFile.document.xlsxReflow')}
          </button>
          <button
            className={styles.tab}
            data-active={resolvedMode === 'fidelity'}
            type={'button'}
            onClick={() => setMode('fidelity')}
          >
            {t('workingPanel.localFile.document.xlsxOriginal')}
          </button>
        </div>
      </div>
    </div>
  );
});

XlsxPane.displayName = 'XlsxPane';

export default XlsxPane;
