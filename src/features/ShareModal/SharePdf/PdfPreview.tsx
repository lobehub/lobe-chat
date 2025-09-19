import { LoadingOutlined } from '@ant-design/icons';
import { Button } from '@lobehub/ui';
import { Input, Modal, Spin } from 'antd';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { memo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Flexbox } from 'react-layout-kit';

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

  // Page navigation state
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenPageNumber, setFullscreenPageNumber] = useState<number>(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const handleFullscreen = () => {
    if (pdfData) {
      setFullscreenPageNumber(pageNumber);
      setFullscreenOpen(true);
    }
  };

  const goToFullscreenPrevPage = () => {
    if (fullscreenPageNumber > 1) {
      setFullscreenPageNumber(fullscreenPageNumber - 1);
    }
  };

  const goToFullscreenNextPage = () => {
    if (fullscreenPageNumber < numPages) {
      setFullscreenPageNumber(fullscreenPageNumber + 1);
    }
  };

  const goToFullscreenPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setFullscreenPageNumber(page);
    }
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
    <>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* 全屏按钮 - 移到最外层 */}
        {pdfData && (
          <Button
            icon={<Expand size={16} />}
            onClick={handleFullscreen}
            size="small"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 1000,
            }}
            type="text"
          />
        )}

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

        {/* 页脚导航 */}
        {pdfData && numPages > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 12,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              zIndex: 10,
            }}
          >
            <Flexbox align="center" gap={8} horizontal justify="center">
              <Button
                disabled={pageNumber <= 1}
                icon={<ChevronLeft size={16} />}
                onClick={goToPrevPage}
                size="small"
                type="text"
              />
              <Flexbox align="center" gap={4} horizontal>
                <Input
                  max={numPages}
                  min={1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) goToPage(value);
                  }}
                  size="small"
                  style={{ textAlign: 'center', width: 50 }}
                  type="number"
                  value={pageNumber}
                />
                <span style={{ color: '#666', fontSize: '12px' }}>/ {numPages}</span>
              </Flexbox>
              <Button
                disabled={pageNumber >= numPages}
                icon={<ChevronRight size={16} />}
                onClick={goToNextPage}
                size="small"
                type="text"
              />
            </Flexbox>
          </div>
        )}
      </div>

      {/* 全屏模态框 */}
      <Modal
        centered
        footer={null}
        onCancel={() => setFullscreenOpen(false)}
        open={fullscreenOpen}
        styles={{
          body: { padding: 0 },
          content: { padding: 0 },
        }}
        width="95vw"
      >
        <div style={{ position: 'relative', height: '90vh', overflow: 'auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: '100%',
              padding: 20,
            }}
          >
            <Document file={pdfDataUri} onLoadSuccess={onDocumentLoadSuccess}>
              <Page
                pageNumber={fullscreenPageNumber}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                width={Math.min(window.innerWidth * 0.8, 1000)}
              />
            </Document>
          </div>

          {/* 全屏模式下的导航 */}
          {numPages > 1 && (
            <div
              style={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 20px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 8,
                backdropFilter: 'blur(8px)',
                zIndex: 1001,
              }}
            >
              <Flexbox align="center" gap={12} horizontal>
                <Button
                  disabled={fullscreenPageNumber <= 1}
                  icon={<ChevronLeft size={16} />}
                  onClick={goToFullscreenPrevPage}
                  size="small"
                  type="text"
                  style={{ color: 'white', borderColor: 'white' }}
                />
                <Flexbox align="center" gap={8} horizontal>
                  <Input
                    max={numPages}
                    min={1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) goToFullscreenPage(value);
                    }}
                    size="small"
                    style={{ textAlign: 'center', width: 60 }}
                    type="number"
                    value={fullscreenPageNumber}
                  />
                  <span style={{ color: 'white', fontSize: '14px' }}>/ {numPages}</span>
                </Flexbox>
                <Button
                  disabled={fullscreenPageNumber >= numPages}
                  icon={<ChevronRight size={16} />}
                  onClick={goToFullscreenNextPage}
                  size="small"
                  type="text"
                  style={{ color: 'white', borderColor: 'white' }}
                />
              </Flexbox>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
});

export default PdfPreview;