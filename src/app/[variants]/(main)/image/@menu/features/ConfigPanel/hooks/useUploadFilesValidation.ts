import { App } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { validateImageFiles } from '../utils/imageValidation';

/**
 * File upload validation hook
 * Encapsulates file size and count validation logic, provides user-friendly error messages
 */
export const useUploadFilesValidation = (maxCount?: number, maxFileSize?: number) => {
  const { t } = useTranslation('components');
  const { message } = App.useApp();

  const validateFiles = useCallback(
    (files: File[], currentCount: number = 0): boolean => {
      const validationResult = validateImageFiles(files, {
        maxAddedFiles: maxCount ? maxCount - currentCount : undefined,
        maxFileSize,
      });

      if (!validationResult.valid) {
        // Display user-friendly error messages
        validationResult.errors.forEach((error) => {
          if (error === 'fileSizeExceeded') {
            message.error(t('MultiImagesUpload.validation.fileSizeExceeded'));
          } else if (error === 'imageCountExceeded') {
            message.error(t('MultiImagesUpload.validation.imageCountExceeded'));
          }
        });
        return false;
      }

      return true;
    },
    [maxCount, maxFileSize, message, t],
  );

  return {
    validateFiles,
  };
};
