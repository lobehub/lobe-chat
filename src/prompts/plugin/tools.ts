export interface API {
  desc: string;
  name: string;
}
export interface Tool {
  apis: API[];
  identifier: string;
  name?: string;
  systemRole?: string;
}

export const apiPrompt = (api: API) => `<api identifier="${api.name}">${api.desc}</api>`;

export const toolPrompt = (tool: Tool) =>
  `<collection name="${tool.name}">
${tool.systemRole ? `<collection.instructions>${tool.systemRole}</collection.instructions>` : ''}
${tool.apis.map((api) => apiPrompt(api)).join('\n')}
</collection>`;

export const toolsPrompts = (tools: Tool[]) => {
  const hasTools = tools.length > 0;
  if (!hasTools) return '';

  return tools.map((tool) => toolPrompt(tool)).join('\n');
};
