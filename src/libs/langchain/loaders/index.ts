import chardet from 'chardet';
import iconv from 'iconv-lite';
import {
  SupportedTextSplitterLanguage,
  SupportedTextSplitterLanguages,
} from 'langchain/text_splitter';

import { LANGCHAIN_SUPPORT_TEXT_LIST } from '@/libs/langchain/file';
import { LangChainLoaderType } from '@/libs/langchain/types';

import { CodeLoader } from './code';
import { CsVLoader } from './csv';
import { DocxLoader } from './docx';
import { LatexLoader } from './latex';
import { MarkdownLoader } from './markdown';
import { PdfLoader } from './pdf';
import { PPTXLoader } from './pptx';
import { TextLoader } from './txt';

class LangChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LangChainChunkingError';
  }
}

// 根据实际返回的编码字符串进行可能的映射修正
function mapEncodingName(enc: string): string {
  // 这里只演示常见场景, 实际可结合自己的需要写更多判断
  switch (enc.toLowerCase()) {
    case 'gb-18030':
    case 'gb18030': {
      return 'gb18030';
    }
    case 'gb2312':
    case 'gbk': {
      return 'gbk';
    }
    case 'ascii': {
      return 'utf8';
    } // 通常 ASCII 内容可以当作 UTF-8 处理
    default: {
      return enc;
    } // 其他情况直接返回原字符串
  }
}

export class ChunkingLoader {
  partitionContent = async (filename: string, content: Uint8Array) => {
    try {
      const fileBlob = new Blob([Buffer.from(content)]);
      const txt = this.uint8ArrayToString(content);

      const type = this.getType(filename?.toLowerCase());

      switch (type) {
        case 'code': {
          const ext = filename.split('.').pop();
          return await CodeLoader(txt, ext!);
        }

        case 'ppt': {
          return await PPTXLoader(fileBlob);
        }

        case 'latex': {
          return await LatexLoader(txt);
        }

        case 'pdf': {
          return await PdfLoader(fileBlob);
        }

        case 'markdown': {
          return await MarkdownLoader(txt);
        }

        case 'doc': {
          return await DocxLoader(fileBlob);
        }

        case 'text': {
          return await TextLoader(txt);
        }

        case 'csv': {
          return await CsVLoader(fileBlob);
        }

        default: {
          throw new Error(
            `Unsupported file type [${type}], please check your file is supported, or create report issue here: https://github.com/lobehub/lobe-chat/discussions/3550`,
          );
        }
      }
    } catch (e) {
      throw new LangChainError((e as Error).message);
    }
  };

  private getType = (filename: string): LangChainLoaderType | undefined => {
    if (filename.endsWith('pptx')) {
      return 'ppt';
    }

    if (filename.endsWith('docx') || filename.endsWith('doc')) {
      return 'doc';
    }

    if (filename.endsWith('pdf')) {
      return 'pdf';
    }

    if (filename.endsWith('tex')) {
      return 'latex';
    }

    if (filename.endsWith('md') || filename.endsWith('mdx')) {
      return 'markdown';
    }

    if (filename.endsWith('csv')) {
      return 'csv';
    }

    const ext = filename.split('.').pop();

    if (ext && SupportedTextSplitterLanguages.includes(ext as SupportedTextSplitterLanguage)) {
      return 'code';
    }

    if (ext && LANGCHAIN_SUPPORT_TEXT_LIST.includes(ext)) return 'text';
  };

  private uint8ArrayToString(uint8Array: Uint8Array) {
    // 2. 使用 chardet 检测编码
    //    chardet.detectSync 会返回如 'UTF-8', 'UTF-16LE', 'GB18030' 等字符串
    const detectedEncoding = chardet.detect(uint8Array);
    console.log('Detected Encoding:', detectedEncoding);
    // 3. 如果检测得到编码，就用 iconv-lite 去解码
    //    如果不确定，它可能返回 null，也可能返回最有可能的编码
    if (detectedEncoding) {
      // 特别注意：chardet 可能返回 'GB-18030'，iconv-lite 里常用 'gb18030'
      // 如果返回 'ascii', 通常也能用 'utf8' 解码。
      // @ts-ignore
      return iconv.decode(uint8Array, mapEncodingName(detectedEncoding));
    } else {
      // 如果 chardet 没法判定，指定一个默认编码
      const decoder = new TextDecoder();
      return decoder.decode(uint8Array);
    }
  }
}
