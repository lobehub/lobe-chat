import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { memo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { useIsMobile } from '@/hooks/useIsMobile';

import { useContainerStyles } from '../style';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  loading: boolean;
  pdfData: string | null;
  pageNumber: number;
  onLoadSuccess: (numPages: number) => void;
}

const PdfPreview = memo<PdfPreviewProps>(({ loading, pdfData, pageNumber, onLoadSuccess }) => {
  const { styles } = useContainerStyles();
  const isMobile = useIsMobile();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    onLoadSuccess(numPages);
  };

  if (loading) {
    return (
      <div className={styles.preview} style={{ padding: 12 }}>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            height: '200px',
            justifyContent: 'center',
          }}
        >
          <Spin
            indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />}
          />
          <div style={{ color: '#666', marginTop: 8 }}>Generating PDF...</div>
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
            color: '#666',
            display: 'flex',
            height: '200px',
            justifyContent: 'center',
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
    <div
      className={styles.preview}
      style={{
        padding: 12,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}
    >
      <Document
        file={pdfDataUri}
        loading={
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <Spin />
            <div style={{ color: '#666', marginTop: 8 }}>Loading PDF...</div>
          </div>
        }
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page
          pageNumber={pageNumber}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          width={isMobile ? 300 : 400}
        />
      </Document>
    </div>
  );
});

export default PdfPreview;