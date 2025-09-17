import dayjs from 'dayjs';
import { useCallback, useState } from 'react';

import { BRANDING_NAME } from '@/const/branding';

export const usePdfExport = ({
  title = 'share',
  id = '#preview',
}: {
  id?: string;
  title?: string;
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      // Dynamic imports to avoid bundling if not used
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const element = document.querySelector(id) as HTMLElement;
      if (!element) {
        throw new Error('Element not found');
      }

      // Create canvas from the element
      const canvas = await html2canvas(element, {
        allowTaint: true,
        backgroundColor: null,
        height: element.scrollHeight,
        scale: 2,
        useCORS: true,
        width: element.scrollWidth,
      });

      // Calculate PDF dimensions
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add pages as needed
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const fileName = `${BRANDING_NAME}_${title}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      pdf.save(fileName);

      setLoading(false);
    } catch (error) {
      console.error('Failed to export PDF', error);
      setLoading(false);
    }
  }, [id, title]);

  return {
    loading,
    onDownload: handleDownload,
    title,
  };
};