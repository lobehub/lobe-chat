/**
 * Image file validation utility functions
 */

export interface ValidationResult {
  error?: string;
  valid: boolean;
}

/**
 * Validate single image file size
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes, skip validation if not provided
 * @returns Validation result
 */
export const validateImageFileSize = (file: File, maxSize?: number): ValidationResult => {
  if (!maxSize) return { valid: true };

  if (file.size > maxSize) {
    return {
      error: 'fileSizeExceeded',
      valid: false,
    };
  }

  return { valid: true };
};

/**
 * Validate image count
 * @param count - Current image count
 * @param maxCount - Maximum allowed count, skip validation if not provided
 * @returns Validation result
 */
export const validateImageCount = (count: number, maxCount?: number): ValidationResult => {
  console.log('count', count, 'maxCount', maxCount);
  if (!maxCount) return { valid: true };

  if (count > maxCount) {
    return {
      error: 'imageCountExceeded',
      valid: false,
    };
  }

  return { valid: true };
};

/**
 * Validate image file list
 * @param files - File list
 * @param constraints - Constraint configuration
 * @returns Validation result, including validation result for each file
 */
export const validateImageFiles = (
  files: File[],
  constraints: {
    maxAddedFiles?: number;
    maxFileSize?: number;
  },
): {
  errors: string[];
  fileResults: ValidationResult[];
  valid: boolean;
} => {
  const errors: string[] = [];
  const fileResults: ValidationResult[] = [];

  // Validate file count
  const countResult = validateImageCount(files.length, constraints.maxAddedFiles);
  if (!countResult.valid && countResult.error) {
    errors.push(countResult.error);
  }

  // Validate each file
  files.forEach((file) => {
    const fileSizeResult = validateImageFileSize(file, constraints.maxFileSize);
    fileResults.push(fileSizeResult);

    if (!fileSizeResult.valid && fileSizeResult.error) {
      errors.push(fileSizeResult.error);
    }
  });

  return {
    errors: Array.from(new Set(errors)), // Remove duplicates
    fileResults,
    valid: errors.length === 0,
  };
};
