import { Tool, toolsPrompts } from './tools';

export const pluginPrompts = ({ tools }: { tools: Tool[] }) => {
  const prompt = `<plugins_info>
${toolsPrompts(tools)}
</plugins_info>`;

  return prompt.trim();
};
