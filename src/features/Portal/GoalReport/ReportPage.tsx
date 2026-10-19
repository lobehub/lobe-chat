import { HTML_DOCUMENT_FILE_TYPE } from '@lobechat/const';
import { Skeleton } from '@lobehub/ui';
import { memo, type ReactNode } from 'react';

import { HtmlDocumentFrame } from '@/components/HtmlPreview';
import { useDocumentStore } from '@/store/document';

interface ReportPageProps {
  documentId: string;
  /** What to show when the page is gone or is no longer an HTML page. */
  fallback: ReactNode;
}

/**
 * The report's HTML page, in the same sandboxed frame an HTML page uses in the
 * page editor. The markdown report stays the fallback.
 */
const ReportPage = memo<ReportPageProps>(({ documentId, fallback }) => {
  const useFetchDocumentDetail = useDocumentStore((s) => s.useFetchDocumentDetail);
  const { data: page, isLoading } = useFetchDocumentDetail(documentId);

  if (isLoading) return <Skeleton height={320} radius={8} />;
  if (page?.fileType !== HTML_DOCUMENT_FILE_TYPE || !page.content) return fallback;

  return <HtmlDocumentFrame content={page.content} title={page.title ?? undefined} />;
});

ReportPage.displayName = 'GoalReportPage';

export default ReportPage;
