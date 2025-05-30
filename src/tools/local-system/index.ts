import { BuiltinToolManifest } from '@/types/tool';

import { systemPrompt } from './systemRole';

export const LocalSystemApiName = {
  listLocalFiles: 'listLocalFiles',
  moveLocalFiles: 'moveLocalFiles',
  readLocalFile: 'readLocalFile',
  renameLocalFile: 'renameLocalFile',
  searchLocalFiles: 'searchLocalFiles',
  writeLocalFile: 'writeLocalFile',
};

export const LocalSystemManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'List files and folders in a specified directory. Input should be a path. Output is a JSON array of file/folder names.',
      name: LocalSystemApiName.listLocalFiles,
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
      name: LocalSystemApiName.readLocalFile,
      parameters: {
        properties: {
          loc: {
            description:
              'Optional range of lines to read [startLine, endLine]. Defaults to [0, 200] if not specified.',
            items: {
              type: 'number',
            },
            type: 'array',
          },
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
      name: LocalSystemApiName.searchLocalFiles,
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
    {
      description:
        'Moves or renames multiple files/directories. Input is an array of objects, each containing an oldPath and a newPath.',
      name: LocalSystemApiName.moveLocalFiles,
      parameters: {
        properties: {
          items: {
            description: 'A list of move/rename operations to perform.',
            items: {
              properties: {
                newPath: {
                  description:
                    'The target absolute path for the file/directory (can include a new name).',
                  type: 'string',
                },
                oldPath: {
                  description: 'The current absolute path of the file/directory to move or rename.',
                  type: 'string',
                },
              },
              required: ['oldPath', 'newPath'],
              type: 'object',
            },
            type: 'array',
          },
        },
        required: ['items'],
        type: 'object',
      },
    },
    {
      description:
        'Rename a file or folder in its current location. Input should be the current full path and the new name.',
      name: LocalSystemApiName.renameLocalFile,
      parameters: {
        properties: {
          newName: {
            description: 'The new name for the file or folder (without path)',
            type: 'string',
          },
          path: {
            description: 'The current full path of the file or folder to rename',
            type: 'string',
          },
        },
        required: ['path', 'newName'],
        type: 'object',
      },
    },
    {
      description:
        'Write content to a specific file. Input should be the file path and content. Overwrites existing file or creates a new one.',
      name: LocalSystemApiName.writeLocalFile,
      parameters: {
        properties: {
          content: {
            description: 'The content to write',
            type: 'string',
          },
          path: {
            description: 'The file path to write to',
            type: 'string',
          },
        },
        required: ['path', 'content'],
        type: 'object',
      },
    },
  ],
  identifier: 'lobe-local-system',
  meta: {
    avatar: '📁',
    title: 'Local System',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};
