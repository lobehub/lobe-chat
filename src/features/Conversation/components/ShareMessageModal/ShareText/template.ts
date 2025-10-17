import { template } from 'lodash-es';

import { LOADING_FLAT } from '@/const/message';
import { ChatMessage } from '@/types/message';

const markdownTemplate = template(
  `<% messages.forEach(function(chat) { %>

{{chat.content}}

<% }); %>
`,
  {
    evaluate: /<%([\S\s]+?)%>/g,
    interpolate: /{{([\S\s]+?)}}/g,
  },
);

interface MarkdownParams {
  messages: ChatMessage[];
}

export const generateMarkdown = ({ messages }: MarkdownParams) =>
  markdownTemplate({
    messages: messages.filter((m) => m.content !== LOADING_FLAT),
  });
