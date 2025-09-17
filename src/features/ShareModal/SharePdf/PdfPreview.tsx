import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { memo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { useIsMobile } from '@/hooks/useIsMobile';

import { useContainerStyles } from '../style';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  loading: boolean;
  pdfData: string | null;
}

const PdfPreview = memo<PdfPreviewProps>(({ loading, pdfData }) => {
  const { styles } = useContainerStyles();
  const isMobile = useIsMobile();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber] = useState<number>(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return (
      <div className={styles.preview} style={{ padding: 12 }}>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            height: '200px',
            justifyContent: 'center',
          }}
        >
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            tip="Generating PDF..."
          />
        </div>
      </div>
    );
  }

  if (!pdfData) {
    return (
      <div className={styles.preview} style={{ padding: 12 }}>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            height: '200px',
            justifyContent: 'center',
            color: '#666',
          }}
        >
          No PDF data available
        </div>
      </div>
    );
  }

  // Convert base64 to data URI
  const pdfDataUri = `data:application/pdf;base64,${pdfData}`;

  return (
    <div className={styles.preview} style={{ padding: 12 }}>
      <Document
        file={pdfDataUri}
        loading={
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Loading PDF..." />
          </div>
        }
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page
          pageNumber={pageNumber}
          width={isMobile ? 300 : 400}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
      {numPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '12px', color: '#666' }}>
          Page {pageNumber} of {numPages}
        </div>
      )}
    </div>
  );
});

export default PdfPreview;