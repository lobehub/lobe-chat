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

export const apiPrompt = (api: API) => `<api name="${api.name}">${api.desc}</api>`;

export const toolPrompt = (tool: Tool) =>
  `<tool name="${tool.name}" identifier="${tool.identifier}">
${tool.systemRole ? `<tool_instructions>${tool.systemRole}</tool_instructions>` : ''}
${tool.apis.map((api) => apiPrompt(api)).join('\n')}
</tool>`;

export const toolsPrompts = (tools: Tool[]) => {
  const hasTools = tools.length > 0;
  if (!hasTools) return '';

  return `<tools>
<description>The tools you can use below</description>
${tools.map((tool) => toolPrompt(tool)).join('\n')}
</tools>`;
};
