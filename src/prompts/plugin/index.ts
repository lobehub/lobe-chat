import { Tool, toolsPrompts } from './tools';

export const pluginPrompts = ({ tools }: { tools: Tool[] }) => {
  const prompt = `<plugins>
${toolsPrompts(tools)}
</plugins>`;

  return prompt.trim();
};
