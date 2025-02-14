import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@langchain/community/document_loaders/fs/pdf', () => {
  const mockLoad = vi.fn();
  return {
    PDFLoader: vi.fn().mockImplementation(
      (_blob: Blob, options?: { splitPages: boolean }) =>
        ({
          load: mockLoad,
          options,
          splitPages: options?.splitPages,
          pdfjs: {},
          parsedItemSeparator: '\n\n',
          parse: vi.fn(),
          _pdfjs: {},
          filePathOrBlob: _blob,
          loadAndSplit: vi.fn(),
        }) as any,
    ),
  };
});

describe('PdfLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load pdf and split pages', async () => {
    const mockPdfDoc = [
      {
        pageContent: 'Page 1 content',
        metadata: { page: 1 },
      },
      {
        pageContent: 'Page 2 content',
        metadata: { page: 2 },
      },
    ];

    const { PDFLoader } = await import('@langchain/community/document_loaders/fs/pdf');
    vi.mocked(PDFLoader).mockImplementation(
      () =>
        ({
          load: vi.fn().mockResolvedValue(mockPdfDoc),
          splitPages: true,
          pdfjs: {},
          parsedItemSeparator: '\n\n',
          parse: vi.fn(),
          _pdfjs: {},
          filePathOrBlob: new Blob(),
          loadAndSplit: vi.fn(),
        }) as any,
    );

    const { PdfLoader } = await import('./index');
    const testBlob = new Blob(['test pdf content'], { type: 'application/pdf' });
    const result = await PdfLoader(testBlob);

    expect(result).toEqual(mockPdfDoc);
  });

  it('should handle empty pdf', async () => {
    const { PDFLoader } = await import('@langchain/community/document_loaders/fs/pdf');
    vi.mocked(PDFLoader).mockImplementation(
      () =>
        ({
          load: vi.fn().mockResolvedValue([]),
          splitPages: true,
          pdfjs: {},
          parsedItemSeparator: '\n\n',
          parse: vi.fn(),
          _pdfjs: {},
          filePathOrBlob: new Blob(),
          loadAndSplit: vi.fn(),
        }) as any,
    );

    const { PdfLoader } = await import('./index');
    const emptyBlob = new Blob([''], { type: 'application/pdf' });
    const result = await PdfLoader(emptyBlob);

    expect(result).toEqual([]);
  });

  it('should handle pdf loading errors', async () => {
    const { PDFLoader } = await import('@langchain/community/document_loaders/fs/pdf');
    vi.mocked(PDFLoader).mockImplementation(
      () =>
        ({
          load: vi.fn().mockRejectedValue(new Error('Failed to load PDF')),
          splitPages: true,
          pdfjs: {},
          parsedItemSeparator: '\n\n',
          parse: vi.fn(),
          _pdfjs: {},
          filePathOrBlob: new Blob(),
          loadAndSplit: vi.fn(),
        }) as any,
    );

    const { PdfLoader } = await import('./index');
    const testBlob = new Blob(['invalid pdf'], { type: 'application/pdf' });

    await expect(PdfLoader(testBlob)).rejects.toThrow('Failed to load PDF');
  });

  it('should pass splitPages option', async () => {
    const mockPdfDoc = [
      {
        pageContent: 'Test content',
        metadata: { page: 1 },
      },
    ];

    const { PDFLoader } = await import('@langchain/community/document_loaders/fs/pdf');
    const { PdfLoader } = await import('./index');

    const testBlob = new Blob(['test'], { type: 'application/pdf' });

    vi.mocked(PDFLoader).mockImplementation(
      () =>
        ({
          load: vi.fn().mockResolvedValue(mockPdfDoc),
          splitPages: true,
          pdfjs: {},
          parsedItemSeparator: '\n\n',
          parse: vi.fn(),
          _pdfjs: {},
          filePathOrBlob: new Blob(),
          loadAndSplit: vi.fn(),
        }) as any,
    );

    await PdfLoader(testBlob);

    expect(PDFLoader).toHaveBeenCalledWith(testBlob, { splitPages: true });
  });
});
