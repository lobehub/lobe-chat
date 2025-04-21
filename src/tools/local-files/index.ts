import { BuiltinToolManifest } from '@/types/tool';

import { systemPrompt } from './systemRole';

export const LocalFilesApiName = {
  listLocalFiles: 'listLocalFiles',
  readLocalFile: 'readLocalFile',
  searchLocalFiles: 'searchLocalFiles',
  writeFile: 'writeFile',
};

export const LocalFilesManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'List files and folders in a specified directory. Input should be a path. Output is a JSON array of file/folder names.',
      name: LocalFilesApiName.listLocalFiles,
      parameters: {
        properties: {
          path: {
            description: 'The directory path to list',
            type: 'string',
          },
        },
        required: ['path'],
        type: 'object',
      },
    },
    {
      description:
        'Read the content of a specific file. Input should be the file path. Output is the file content as a string.',
      name: LocalFilesApiName.readLocalFile,
      parameters: {
        properties: {
          path: {
            description: 'The file path to read',
            type: 'string',
          },
        },
        required: ['path'],
        type: 'object',
      },
    },
    {
      description:
        'Search for files within the workspace based on a query string and optional filter options. Input should include the search query and any filter options. Output is a JSON array of matching file paths.',
      name: LocalFilesApiName.searchLocalFiles,
      parameters: {
        properties: {
          contentContains: {
            description: 'The file content must contain this string',
            type: 'string',
          },
          createdAfter: {
            description:
              'Files created after this date (ISO 8601 format, e.g., 2023-10-26T10:00:00Z)',
            format: 'date-time',
            type: 'string',
          },
          createdBefore: {
            description: 'Files created before this date (ISO 8601 format)',
            format: 'date-time',
            type: 'string',
          },
          exclude: {
            description: 'Array of file or directory paths to exclude',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          fileTypes: {
            description: 'Array of file types to include (e.g., "public.image", "txt")',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          keywords: {
            description: 'The search keywords string (can include partial names or keywords)',
            type: 'string',
          },
          limit: {
            description: 'Limit the number of results returned',
            type: 'number',
          },
          liveUpdate: {
            description: 'Whether to update search results live (if supported)',
            type: 'boolean',
          },
          modifiedAfter: {
            description: 'Files modified after this date (ISO 8601 format)',
            format: 'date-time',
            type: 'string',
          },
          modifiedBefore: {
            description: 'Files modified before this date (ISO 8601 format)',
            format: 'date-time',
            type: 'string',
          },
          onlyIn: {
            description: 'Limit the search to this specific directory path',
            type: 'string',
          },
          sortBy: {
            description: 'Sort results by',
            enum: ['name', 'date', 'size'],
            type: 'string',
          },
          sortDirection: {
            description: 'Sort direction',
            enum: ['asc', 'desc'],
            type: 'string',
          },
        },
        required: ['keywords'],
        type: 'object',
      },
    },
    // TODO: Add writeFile API definition later
    // {
    //   description:
    //     'Write content to a specific file. Input should be the file path and content. Overwrites existing file or creates a new one.',
    //   name: LocalFilesApiName.writeFile,
    //   parameters: {
    //     properties: {
    //       path: {
    //         description: 'The file path to write to',
    //         type: 'string',
    //       },
    //       content: {
    //         description: 'The content to write',
    //         type: 'string',
    //       },
    //     },
    //     required: ['path', 'content'],
    //     type: 'object',
    //   },
    // },
  ],
  identifier: 'lobe-local-files',
  meta: {
    avatar: '📁',
    title: 'Local Files',
  },
  // Use a simplified system role for now
  systemRole: systemPrompt(),
  type: 'builtin',
};
