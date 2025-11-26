export interface FileContent {
  content: string;
  error?: string;
  fileId: string;
  filename: string;
}

/**
 * Formats a single file content with XML tags
 */
const formatFileContent = (file: FileContent): string => {
  if (file.error) {
    return `<file id="${file.fileId}" name="${file.filename}" error="${file.error}" />`;
  }

  return `<file id="${file.fileId}" name="${file.filename}">
${file.content}
</file>`;
};

/**
 * Format file contents prompt for AI consumption using XML structure
 */
export const promptFileContents = (fileContents: FileContent[]): string => {
  const filesXml = fileContents.map((file) => formatFileContent(file)).join('\n');

  return `<knowledge_base_files totalCount="${fileContents.length}">
<instruction>Use the information from these files to answer the user's question. Always cite the source files.</instruction>
${filesXml}
</knowledge_base_files>`;
};
