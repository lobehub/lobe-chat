import { Tool, toolsPrompts } from './tools';

export const pluginPrompts = ({ tools }: { tools: Tool[] }) => {
  const prompt = `<plugins description="The plugins you can use below">
${toolsPrompts(tools)}
</plugins>`;

  return prompt.trim();
};
