import zlib from 'node:zlib';
import pMap from 'p-map';
import { UnstructuredClient } from 'unstructured-client';
import { Strategy } from 'unstructured-client/sdk/models/shared';
import { PartitionResponse } from 'unstructured-client/src/sdk/models/operations';

import { knowledgeEnv } from '@/envs/knowledge';

export enum ChunkingStrategy {
  Basic = 'basic',
  ByPage = 'by_page',
  BySimilarity = 'by_similarity',
  ByTitle = 'by_title',
}

export interface UnstructuredPartitionElement {
  compositeId?: string;
  element_id: string;
  metadata: Metadata;
  text: string;
  type: string;
}

export interface Metadata {
  coordinates: Coordinates;
  filename: string;
  filetype: string;
  image_base64?: string;
  image_mime_type?: string;
  is_continuation?: boolean;
  languages: string[];
  orig_elements?: string;
  page_name?: string;
  page_number: number;
  parent_id?: string;
  text_as_html?: string;
}

export interface Coordinates {
  layout_height: number;
  layout_width: number;
  points: number[][];
  system: string;
}

// class UnstructuredError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = 'Unstructured';
//   }
// }

interface PartitionParameters {
  chunkingStrategy?: ChunkingStrategy;
  fileContent: Uint8Array;
  filename: string;
  maxCharacters?: number;
  onResponse?: (response: PartitionResponse) => void;
  strategy?: Strategy;
}

export class Unstructured {
  private client: UnstructuredClient;

  constructor(apikey?: string) {
    this.client = new UnstructuredClient({
      security: { apiKeyAuth: apikey || knowledgeEnv.UNSTRUCTURED_API_KEY! },
      serverURL: knowledgeEnv.UNSTRUCTURED_SERVER_URL,
    });
  }

  async partition(params: PartitionParameters): Promise<{
    compositeElements: UnstructuredPartitionElement[];
    originElements: UnstructuredPartitionElement[];
  }> {
    const hasChunkingStrategy = !!params.chunkingStrategy;
    const response = await this.client.general.partition({
      partitionParameters: {
        chunkingStrategy: params.chunkingStrategy,
        coordinates: true,
        // extractImageBlockTypes: ['Image'],
        files: { content: params.fileContent, fileName: params.filename },

        includeOrigElements: true,
        maxCharacters: params.maxCharacters || 800,
        strategy: params.strategy,
        uniqueElementIds: true,
      },
    });

    if (response.statusCode === 200) {
      // after finish partition, we need to filter out some elements
      const elements = response.elements as UnstructuredPartitionElement[];

      params.onResponse?.(response);

      let originElements: UnstructuredPartitionElement[] = [];
      let compositeElements: UnstructuredPartitionElement[] = [];

      if (hasChunkingStrategy) {
        await pMap(elements, async (element) => {
          // Your Base64 encoded string
          const base64EncodedString = element.metadata.orig_elements as string;
          delete element.metadata.orig_elements;

          if (!base64EncodedString) return;

          // Step 1: Decode the Base64 encoded string to binary
          const binaryBuffer = Buffer.from(base64EncodedString, 'base64');

          // Step 2: Decompress the binary data
          const elements = await this.decompressGzip(binaryBuffer);

          // if element is Table type then get the origin
          if (element.type === 'Table') {
            // skip continuation table due to being split by chunk strategy
            if (element.metadata.is_continuation) {
              return;
            }

            compositeElements = [...compositeElements, elements[0]];
            originElements = [...originElements, elements[0]];
            return;
          }

          compositeElements = [...compositeElements, element];

          originElements = originElements.concat(
            elements.map(
              (e) => ({ ...e, compositeId: element.element_id }) as UnstructuredPartitionElement,
            ),
          );
        });
      } else {
        originElements = elements;
      }

      return { compositeElements, originElements };
    } else {
      return { compositeElements: [], originElements: [] };
    }
  }

  private async decompressGzip(data: Buffer): Promise<UnstructuredPartitionElement[]> {
    return new Promise((resolve, reject) => {
      zlib.inflate(data, (err, decompressedBuffer) => {
        if (err) {
          reject(err);
        }

        // Step 3: Convert the decompressed buffer to a string
        let decompressedString = decompressedBuffer.toString('utf8');

        // Step 4: Parse the JSON string
        let jsonObject = JSON.parse(decompressedString);

        resolve(jsonObject);
      });
    });
  }
}
