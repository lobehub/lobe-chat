import { describe, expect, it } from 'vitest';

import { ChatFileItem, ChatImageItem } from '@/types/message';

import { filesPrompts } from './index';

describe('filesPrompts', () => {
  // 创建测试用的示例数据
  const mockImage: ChatImageItem = {
    id: 'img-1',
    alt: 'test image',
    url: 'https://example.com/image.jpg',
  };

  const mockFile: ChatFileItem = {
    id: 'file-1',
    name: 'test.pdf',
    fileType: 'application/pdf',
    size: 1024,
    url: 'https://example.com/test.pdf',
  };

  it('should generate prompt with only images', () => {
    const result = filesPrompts({
      imageList: [mockImage],
      fileList: undefined,
    });

    expect(result).toEqual(
      `<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<files_info>
<images>
<images_docstring>here are user upload images you can refer to</images_docstring>
<image name="test image" url="https://example.com/image.jpg"></image>
</images>

</files_info>
<!-- END SYSTEM CONTEXT -->`,
    );
  });

  it('should generate prompt with only files', () => {
    const result = filesPrompts({
      imageList: [],
      fileList: [mockFile],
    });

    expect(result).toEqual(
      `<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<files_info>

<files>
<files_docstring>here are user upload files you can refer to</files_docstring>
<file id="file-1" name="test.pdf" type="application/pdf" size="1024" url="https://example.com/test.pdf"></file>
</files>
</files_info>
<!-- END SYSTEM CONTEXT -->`,
    );
  });

  it('should generate prompt with both images and files', () => {
    const result = filesPrompts({
      imageList: [mockImage],
      fileList: [mockFile],
    });

    expect(result).toEqual(
      `<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<files_info>
<images>
<images_docstring>here are user upload images you can refer to</images_docstring>
<image name="test image" url="https://example.com/image.jpg"></image>
</images>
<files>
<files_docstring>here are user upload files you can refer to</files_docstring>
<file id="file-1" name="test.pdf" type="application/pdf" size="1024" url="https://example.com/test.pdf"></file>
</files>
</files_info>
<!-- END SYSTEM CONTEXT -->`,
    );
  });

  it('should generate prompt with empty lists', () => {
    const result = filesPrompts({
      imageList: [],
      fileList: [],
    });

    expect(result).toEqual('');
  });

  it('should handle multiple images and files', () => {
    const images: ChatImageItem[] = [
      mockImage,
      {
        id: 'img-2',
        alt: 'second image',
        url: 'https://example.com/image2.jpg',
      },
    ];

    const files: ChatFileItem[] = [
      mockFile,
      {
        id: 'file-2',
        name: 'document.docx',
        fileType: 'application/docx',
        size: 2048,
        url: 'https://example.com/document.docx',
      },
    ];

    const result = filesPrompts({
      imageList: images,
      fileList: files,
    });

    expect(result).toContain('second image');
    expect(result).toContain('document.docx');
    expect(result).toMatch(/<image.*?>.*<image.*?>/s); // Check for multiple image tags
    expect(result).toMatch(/<file.*?>.*<file.*?>/s); // Check for multiple file tags
  });
});
