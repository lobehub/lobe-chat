import { useCallback, useState } from 'react';

import { lambdaQuery as trpc } from '@/libs/trpc/client/lambda';

interface PdfGenerationState {
  downloadPdf: () => Promise<void>;
  error: string | null;
  generatePdf: (sessionId: string, topicId?: string) => Promise<void>;
  loading: boolean;
  pdfData: string | null;
}

export const usePdfGeneration = (): PdfGenerationState => {
  const [loading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('chat-export.pdf');
  const [error, setError] = useState<string | null>(null);

  const exportPdfMutation = trpc.exporter.exportPdf.useMutation();

  const generatePdf = useCallback(async (sessionId: string, topicId?: string) => {
    try {
      setLoading(true);
      setError(null);
      setPdfData(null);

      const result = await exportPdfMutation.mutateAsync({
        sessionId,
        topicId,
      });

      setPdfData(result.pdf);
      setFilename(result.filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  }, [exportPdfMutation]);

  const downloadPdf = useCallback(async () => {
    if (!pdfData) return;

    try {
      // Convert base64 to blob
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw error;
    }
  }, [pdfData, filename]);

  return {
    downloadPdf,
    error,
    generatePdf,
    loading,
    pdfData,
  };
};