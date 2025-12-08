/**
 * Tool Descriptions - Complete list of available document manipulation tools
 */
const toolDescriptions = {
  // Batch Operations
  batchUpdate: 'Update multiple nodes at once with the same changes',

  compareSnapshots: 'Compare differences between two snapshots',

  convertToList: 'Convert nodes to a list',

  // Basic CRUD
  createNode: 'Add new nodes (paragraphs, images, tables, etc.)',

  cropImage: 'Crop an image to a specific region',

  deleteNode: 'Remove nodes (requires confirmation)',

  deleteSnapshot: 'Delete a snapshot',

  deleteTableColumn: 'Remove a column from a table',

  deleteTableRow: 'Remove a row from a table',

  duplicateNode: 'Copy a node and insert the duplicate',

  // Document Metadata
  editTitle: 'Edit the title of the current document',

  // List Operations
  indentListItem: 'Indent a list item (increase nesting)',

  // Initialize
  initPage: "Initialize a new document from Markdown content. Don't include the title.",

  insertTableColumn: 'Add a new column to a table',

  // Table Operations
  insertTableRow: 'Add a new row to a table',

  listSnapshots: 'List all saved snapshots',

  mergeNodes: 'Combine adjacent sibling nodes into one',

  moveNode: 'Relocate nodes within the document',

  outdentListItem: 'Outdent a list item (decrease nesting)',

  // Text Operations
  replaceText: 'Find and replace text across document or specific nodes',

  // Image Operations
  resizeImage: 'Resize an image (width/height)',

  restoreSnapshot: 'Restore document to a previous snapshot',

  rotateImage: 'Rotate an image by 90/180/270 degrees',

  // Snapshot Operations
  saveSnapshot: 'Save current document state as a restore point',

  setImageAlt: 'Set alt text for accessibility',

  splitNode: 'Split a node into two at a specific position',

  toggleListType: 'Switch between ul and ol',

  unwrapNode: 'Remove wrapper while keeping children',

  updateNode: 'Modify existing node content or attributes',

  // Structure Operations
  wrapNodes: 'Wrap nodes with a new parent container',
} as const;

/**
 * Enabled Tools - List of tools currently available to the agent
 * Comment out or remove tools to disable them
 */
const enabledTools = [
  // Initialize
  'initPage',

  // Document Metadata
  'editTitle',

  // Basic CRUD - Currently disabled for MVP
  // 'createNode',
  // 'updateNode',
  // 'deleteNode',
  // 'moveNode',
  // 'duplicateNode',

  // Text Operations - Currently disabled for MVP
  // 'replaceText',

  // Batch Operations - Currently disabled for MVP
  // 'batchUpdate',

  // Structure Operations - Currently disabled for MVP
  // 'wrapNodes',
  // 'unwrapNode',
  // 'mergeNodes',
  // 'splitNode',

  // Table Operations - Currently disabled for MVP
  // 'insertTableRow',
  // 'insertTableColumn',
  // 'deleteTableRow',
  // 'deleteTableColumn',

  // Image Operations - Currently disabled for MVP
  // 'resizeImage',
  // 'cropImage',
  // 'rotateImage',
  // 'setImageAlt',

  // List Operations - Currently disabled for MVP
  // 'indentListItem',
  // 'outdentListItem',
  // 'toggleListType',
  // 'convertToList',

  // Snapshot Operations - Currently disabled for MVP
  // 'saveSnapshot',
  // 'restoreSnapshot',
  // 'listSnapshots',
  // 'deleteSnapshot',
  // 'compareSnapshots',
] as const;

/**
 * Generate the capabilities list from enabled tools
 */
function generateCapabilitiesList(): string {
  const categories = {
    'Basic CRUD': ['createNode', 'updateNode', 'deleteNode', 'moveNode', 'duplicateNode'],
    'Batch Operations': ['batchUpdate'],
    'Document Metadata': ['editTitle'],
    'Image Operations': ['resizeImage', 'cropImage', 'rotateImage', 'setImageAlt'],
    'Initialize': ['initPage'],
    'List Operations': ['indentListItem', 'outdentListItem', 'toggleListType', 'convertToList'],
    'Snapshot Operations': [
      'saveSnapshot',
      'restoreSnapshot',
      'listSnapshots',
      'deleteSnapshot',
      'compareSnapshots',
    ],
    'Structure Operations': ['wrapNodes', 'unwrapNode', 'mergeNodes', 'splitNode'],
    'Table Operations': [
      'insertTableRow',
      'insertTableColumn',
      'deleteTableRow',
      'deleteTableColumn',
    ],
    'Text Operations': ['replaceText'],
  };

  const enabledSet = new Set(enabledTools);
  let result = '';
  let counter = 1;

  for (const [category, tools] of Object.entries(categories)) {
    const enabledInCategory = tools.filter((tool) => enabledSet.has(tool as any));

    if (enabledInCategory.length > 0) {
      result += `\n**${category}:**\n`;
      for (const tool of enabledInCategory) {
        result += `${counter}. **${tool}** - ${toolDescriptions[tool as keyof typeof toolDescriptions]}\n`;
        counter++;
      }
    }
  }

  return result;
}

export const systemPrompt = `You have access to a Document tool that allows you to manipulate XML-structured documents. The document consists of nodes with unique IDs, and you can perform comprehensive operations including CRUD, search, batch updates, text replacement, and table manipulations.

<document_structure>
Documents use an XML-based structure where each element has a unique "id" attribute:
- Root element: <root>...</root>
- Paragraphs: <p id="..."><span id="...">text content</span></p>
- Files/Images: <file id="..." src="..."></file> or <img id="..." src="..."/>
- Headings: <h1 id="...">...</h1> through <h6 id="...">...</h6>
- Lists: <ul id="..."><li id="...">...</li></ul> or <ol id="...">...</ol>
- Tables: <table id="..."><thead>...</thead><tbody>...</tbody></table>
- Other elements: blockquote, code, pre, a, div, br, hr, etc.

Example document:
\`\`\`xml
<root>
  <p id="4">
    <span id="2">First paragraph content.</span>
  </p>
  <p id="6">
    <span id="7">Second paragraph content.</span>
  </p>
  <file id="5" src="http://local.file"></file>
  <table id="10">
    <thead id="10a">
      <tr id="11">
        <th id="12">Header 1</th>
        <th id="13">Header 2</th>
      </tr>
    </thead>
    <tbody id="10b">
      <tr id="14">
        <td id="15">Cell 1</td>
        <td id="16">Cell 2</td>
      </tr>
    </tbody>
  </table>
</root>
\`\`\`
</document_structure>

<core_capabilities>${generateCapabilitiesList()}
</core_capabilities>

<workflow>
1. Call initPage with Markdown content to create a new page, then use editTitle to set the title of the page
2. Use saveSnapshot to create a restore point before major changes (when available)
3. Use getNode or findNodes to locate the nodes you need to work with (when available)
4. Identify the nodes by their IDs
5. Perform the required operation(s)
6. Verify changes if needed by calling getNode again (when available)
7. Use saveSnapshot again after completing changes (when available)
</workflow>

<tool_usage_guidelines>

## Initialize

**initPage**
- markdown: Required. The Markdown content to convert into a document
- Converts Markdown to XML structure with unique IDs
- Returns: Root ID and total node count

\`\`\`
initPage({
  markdown: \`# Welcome

This is a paragraph with **bold** and *italic* text.

## Features
- Item 1
- Item 2

| Col A | Col B |
|-------|-------|
| A1    | B1    |
\`
})
// Creates a full document structure from the Markdown
\`\`\`

## Document Metadata

**editTitle**
- title: Required. The new title for the document
- The title is displayed in the document header and stored separately from content
- Returns: Previous title and new title

\`\`\`
editTitle({ title: "My Updated Document Title" })
// Updates the document title immediately
\`\`\`

</tool_usage_guidelines>

<best_practices>
- Start by initializing the page with markdown content using initPage
- Set a meaningful title using editTitle
- Preserve document structure - don't create orphaned nodes
- Always handle potential errors gracefully and inform the user
</best_practices>

<error_handling>
- If a node ID doesn't exist, the operation will fail
- Invalid XML in children will cause creation/update to fail
- Always handle potential errors gracefully and inform the user
</error_handling>
`;
