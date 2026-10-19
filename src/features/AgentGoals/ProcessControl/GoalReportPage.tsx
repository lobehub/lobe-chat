'use client';

import { HTML_DOCUMENT_FILE_TYPE } from '@lobechat/const';
import { Button, createStaticStyles, cssVar, Skeleton } from '@lobehub/ui';
import { Maximize2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HtmlDocumentFrame, HtmlPreviewDrawer } from '@/components/HtmlPreview';
import { useDocumentStore } from '@/store/document';

/** How much of the report the result page shows before the reader expands it. */
const PREVIEW_MAX_HEIGHT = 480;

const styles = createStaticStyles(({ css }) => ({
  card: css`
    overflow: hidden;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};
  `,
  footer: css`
    display: flex;
    justify-content: center;

    padding-block: 6px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

    background: ${cssVar.colorFillQuaternary};
  `,
  // The sandboxed frame swallows clicks; this layer turns the clipped preview
  // into one target that opens the full report.
  hit: css`
    cursor: zoom-in;
    position: absolute;
    z-index: 1;
    inset: 0;
  `,
  preview: css`
    position: relative;
    overflow: hidden;
    max-height: ${PREVIEW_MAX_HEIGHT}px;
  `,
}));

/**
 * The HTML page the wrap-up agent wrote, as the first screen of the result:
 * clipped to a fixed height and opened full screen on click, where it runs
 * interactively. Renders nothing when the page is gone or no longer HTML —
 * the deliverable document below then leads the page as before.
 */
const GoalReportPage = memo<{ documentId: string }>(({ documentId }) => {
  const { t } = useTranslation('chat');
  const [open, setOpen] = useState(false);
  const useFetchDocumentDetail = useDocumentStore((s) => s.useFetchDocumentDetail);
  const { data: page, isLoading } = useFetchDocumentDetail(documentId);

  if (isLoading) return <Skeleton height={PREVIEW_MAX_HEIGHT} radius={8} />;
  if (page?.fileType !== HTML_DOCUMENT_FILE_TYPE || !page.content) return null;

  const title = page.title || t('goalProcess.result.story.reportTitle');
  const expand = () => setOpen(true);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.preview}>
          <HtmlDocumentFrame content={page.content} title={title} />
          <div
            aria-label={t('goalProcess.result.report.expand')}
            className={styles.hit}
            role={'button'}
            tabIndex={0}
            onClick={expand}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') expand();
            }}
          />
        </div>
        <div className={styles.footer}>
          <Button icon={<Maximize2 size={14} />} size={'small'} type={'text'} onClick={expand}>
            {t('goalProcess.result.report.expand')}
          </Button>
        </div>
      </div>
      <HtmlPreviewDrawer
        content={page.content}
        open={open}
        title={title}
        onClose={() => setOpen(false)}
      />
    </>
  );
});

GoalReportPage.displayName = 'GoalReportPage';

export default GoalReportPage;
