import { BuiltinToolManifest } from '@lobechat/types';

import { systemPrompt } from './systemRole';

export const CodeInterpreterApiName = {
  editLocalFile: 'editLocalFile',
  exportFile: 'exportFile',
  getCommandOutput: 'getCommandOutput',
  globLocalFiles: 'globLocalFiles',
  grepContent: 'grepContent',
  killCommand: 'killCommand',
  listLocalFiles: 'listLocalFiles',
  moveLocalFiles: 'moveLocalFiles',
  readLocalFile: 'readLocalFile',
  renameLocalFile: 'renameLocalFile',
  runCommand: 'runCommand',
  searchLocalFiles: 'searchLocalFiles',
  writeLocalFile: 'writeLocalFile',
};

export const CodeInterpreterIdentifier = 'lobe-cloud-code-interpreter';

export const CodeInterpreterManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'List files and folders in a specified directory. Input should be a path. Output is a JSON array of file/folder names.',
      name: CodeInterpreterApiName.listLocalFiles,
      parameters: {
        properties: {
          directoryPath: {
            description: 'The directory path to list',
            type: 'string',
          },
        },
        required: ['directoryPath'],
        type: 'object',
      },
    },
    {
      description:
        'Read the content of a specific file. Input should be the file path. Output is the file content as a string.',
      name: CodeInterpreterApiName.readLocalFile,
      parameters: {
        properties: {
          endLine: {
            description: 'End line number (1-based, inclusive)',
            type: 'number',
          },
          path: {
            description: 'The file path to read',
            type: 'string',
          },
          startLine: {
            description: 'Start line number (1-based)',
            type: 'number',
          },
        },
        required: ['path'],
        type: 'object',
      },
    },
    {
      description: 'Search for files within the sandbox based on keywords and filter options.',
      name: CodeInterpreterApiName.searchLocalFiles,
      parameters: {
        properties: {
          directory: {
            description: 'Directory to search in',
            type: 'string',
          },
          fileType: {
            description: 'File type/extension filter',
            type: 'string',
          },
          keyword: {
            description: 'Filename keyword filter',
            type: 'string',
          },
          modifiedAfter: {
            description: 'Modified time lower bound (ISO date string)',
            type: 'string',
          },
          modifiedBefore: {
            description: 'Modified time upper bound (ISO date string)',
            type: 'string',
          },
        },
        required: ['directory'],
        type: 'object',
      },
    },
    {
      description:
        'Moves or renames multiple files/directories. Input is an array of operations with source and destination paths.',
      humanIntervention: 'required',
      name: CodeInterpreterApiName.moveLocalFiles,
      parameters: {
        properties: {
          operations: {
            description: 'A list of move operations to perform.',
            items: {
              properties: {
                destination: {
                  description: 'The target path for the file/directory.',
                  type: 'string',
                },
                source: {
                  description: 'The current path of the file/directory to move.',
                  type: 'string',
                },
              },
              required: ['source', 'destination'],
              type: 'object',
            },
            type: 'array',
          },
        },
        required: ['operations'],
        type: 'object',
      },
    },
    {
      description:
        'Rename a file or folder in its current location. Input should be the current full path and the new name.',
      name: CodeInterpreterApiName.renameLocalFile,
      parameters: {
        properties: {
          newName: {
            description: 'The new name for the file or folder (filename only, not full path)',
            type: 'string',
          },
          oldPath: {
            description: 'The current full path of the file or folder to rename',
            type: 'string',
          },
        },
        required: ['oldPath', 'newName'],
        type: 'object',
      },
    },
    {
      description:
        'Write content to a specific file. Input should be the file path and content. Overwrites existing file or creates a new one.',
      humanIntervention: 'required',
      name: CodeInterpreterApiName.writeLocalFile,
      parameters: {
        properties: {
          content: {
            description: 'The content to write',
            type: 'string',
          },
          createDirectories: {
            description: 'Whether to create parent directories if they do not exist',
            type: 'boolean',
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
    {
      description:
        'Perform exact string replacements in files. Must read the file first before editing.',
      humanIntervention: 'required',
      name: CodeInterpreterApiName.editLocalFile,
      parameters: {
        properties: {
          all: {
            description: 'Replace all occurrences (default: false)',
            type: 'boolean',
          },
          path: {
            description: 'The absolute path to the file to modify',
            type: 'string',
          },
          replace: {
            description: 'The text to replace with (must differ from search)',
            type: 'string',
          },
          search: {
            description: 'The exact text to search for',
            type: 'string',
          },
        },
        required: ['path', 'search', 'replace'],
        type: 'object',
      },
    },
    {
      description:
        'Execute a shell command and return its output. Supports both synchronous and background execution with timeout control.',
      humanIntervention: 'required',
      name: CodeInterpreterApiName.runCommand,
      parameters: {
        properties: {
          background: {
            description: 'Set to true to run command in background and return commandId',
            type: 'boolean',
          },
          command: {
            description: 'The shell command to execute',
            type: 'string',
          },
          timeout: {
            description: 'Timeout in milliseconds (default: 120000ms)',
            type: 'number',
          },
        },
        required: ['command'],
        type: 'object',
      },
    },
    {
      description:
        'Retrieve output from a running or completed background shell command. Returns only new output since the last check.',
      name: CodeInterpreterApiName.getCommandOutput,
      parameters: {
        properties: {
          commandId: {
            description: 'The ID of the background command to retrieve output from',
            type: 'string',
          },
        },
        required: ['commandId'],
        type: 'object',
      },
    },
    {
      description: 'Kill a running background shell command by its ID.',
      name: CodeInterpreterApiName.killCommand,
      parameters: {
        properties: {
          commandId: {
            description: 'The ID of the background command to kill',
            type: 'string',
          },
        },
        required: ['commandId'],
        type: 'object',
      },
    },
    {
      description:
        'Search for content within files using regex patterns. Supports various output modes and filtering options.',
      name: CodeInterpreterApiName.grepContent,
      parameters: {
        properties: {
          directory: {
            description: 'Directory to search in',
            type: 'string',
          },
          filePattern: {
            description: 'File name pattern filter (e.g., "*.ts")',
            type: 'string',
          },
          pattern: {
            description: 'The regex pattern to search for',
            type: 'string',
          },
          recursive: {
            description: 'Whether to search recursively (default: true)',
            type: 'boolean',
          },
        },
        required: ['pattern', 'directory'],
        type: 'object',
      },
    },
    {
      description:
        'Find files matching glob patterns. Supports standard glob syntax like "**/*.js" or "src/**/*.ts".',
      name: CodeInterpreterApiName.globLocalFiles,
      parameters: {
        properties: {
          directory: {
            description: 'The base directory to search in (defaults to current working directory)',
            type: 'string',
          },
          pattern: {
            description: 'The glob pattern to match files against (e.g. "**/*.js", "*.{ts,tsx}")',
            type: 'string',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
    },
    {
      description:
        'Export a file from the sandbox to cloud storage. The file will be uploaded to a pre-signed URL and can be downloaded by the user.',
      name: CodeInterpreterApiName.exportFile,
      parameters: {
        properties: {
          path: {
            description:
              'The path of the file in the sandbox to export (e.g., "./output/result.csv")',
            type: 'string',
          },
        },
        required: ['path'],
        type: 'object',
      },
    },
  ],
  identifier: CodeInterpreterIdentifier,
  meta: {
    avatar:
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMy4wMTY0IDJDMTAuODE5MyAyIDkuMDM4MjUgMy43MjQ1MyA5LjAzODI1IDUuODUxODVWOC41MTg1MkgxNS45MjM1VjkuMjU5MjZINS45NzgxNEMzLjc4MTA3IDkuMjU5MjYgMiAxMC45ODM4IDIgMTMuMTExMUwyIDE4Ljg4ODlDMiAyMS4wMTYyIDMuNzgxMDcgMjIuNzQwNyA1Ljk3ODE0IDIyLjc0MDdIOC4yNzMyMlYxOS40ODE1QzguMjczMjIgMTcuMzU0MiAxMC4wNTQzIDE1LjYyOTYgMTIuMjUxNCAxNS42Mjk2SDE5LjU5NTZDMjEuNDU0NyAxNS42Mjk2IDIyLjk2MTcgMTQuMTcwNCAyMi45NjE3IDEyLjM3MDRWNS44NTE4NUMyMi45NjE3IDMuNzI0NTMgMjEuMTgwNyAyIDE4Ljk4MzYgMkgxMy4wMTY0Wk0xMi4wOTg0IDYuNzQwNzRDMTIuODU4OSA2Ljc0MDc0IDEzLjQ3NTQgNi4xNDM3OCAxMy40NzU0IDUuNDA3NDFDMTMuNDc1NCA0LjY3MTAzIDEyLjg1ODkgNC4wNzQwNyAxMi4wOTg0IDQuMDc0MDdDMTEuMzM3OCA0LjA3NDA3IDEwLjcyMTMgNC42NzEwMyAxMC43MjEzIDUuNDA3NDFDMTAuNzIxMyA2LjE0Mzc4IDExLjMzNzggNi43NDA3NCAxMi4wOTg0IDYuNzQwNzRaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfODdfODIwNCkiLz4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTguOTgzNCAzMEMyMS4xODA1IDMwIDIyLjk2MTYgMjguMjc1NSAyMi45NjE2IDI2LjE0ODJWMjMuNDgxNUwxNi4wNzYzIDIzLjQ4MTVMMTYuMDc2MyAyMi43NDA4TDI2LjAyMTcgMjIuNzQwOEMyOC4yMTg4IDIyLjc0MDggMjkuOTk5OCAyMS4wMTYyIDI5Ljk5OTggMTguODg4OVYxMy4xMTExQzI5Ljk5OTggMTAuOTgzOCAyOC4yMTg4IDkuMjU5MjggMjYuMDIxNyA5LjI1OTI4TDIzLjcyNjYgOS4yNTkyOFYxMi41MTg1QzIzLjcyNjYgMTQuNjQ1OSAyMS45NDU1IDE2LjM3MDQgMTkuNzQ4NSAxNi4zNzA0TDEyLjQwNDIgMTYuMzcwNEMxMC41NDUxIDE2LjM3MDQgOS4wMzgwOSAxNy44Mjk2IDkuMDM4MDkgMTkuNjI5Nkw5LjAzODA5IDI2LjE0ODJDOS4wMzgwOSAyOC4yNzU1IDEwLjgxOTIgMzAgMTMuMDE2MiAzMEgxOC45ODM0Wk0xOS45MDE1IDI1LjI1OTNDMTkuMTQwOSAyNS4yNTkzIDE4LjUyNDQgMjUuODU2MiAxOC41MjQ0IDI2LjU5MjZDMTguNTI0NCAyNy4zMjkgMTkuMTQwOSAyNy45MjU5IDE5LjkwMTUgMjcuOTI1OUMyMC42NjIgMjcuOTI1OSAyMS4yNzg1IDI3LjMyOSAyMS4yNzg1IDI2LjU5MjZDMjEuMjc4NSAyNS44NTYyIDIwLjY2MiAyNS4yNTkzIDE5LjkwMTUgMjUuMjU5M1oiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl84N184MjA0KSIvPg0KPGRlZnM+DQo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfODdfODIwNCIgeDE9IjEyLjQ4MDkiIHkxPSIyIiB4Mj0iMTIuNDgwOSIgeTI9IjIyLjc0MDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4NCjxzdG9wIHN0b3AtY29sb3I9IiMzMjdFQkQiLz4NCjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE1NjVBNyIvPg0KPC9saW5lYXJHcmFkaWVudD4NCjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl84N184MjA0IiB4MT0iMTkuNTE5IiB5MT0iOS4yNTkyOCIgeDI9IjE5LjUxOSIgeTI9IjMwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+DQo8c3RvcCBzdG9wLWNvbG9yPSIjRkZEQTRCIi8+DQo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGOUM2MDAiLz4NCjwvbGluZWFyR3JhZGllbnQ+DQo8L2RlZnM+DQo8L3N2Zz4=',
    title: 'Cloud Code Interpreter',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};
