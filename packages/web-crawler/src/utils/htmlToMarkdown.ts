import { Readability } from '@mozilla/readability';
import { Window } from 'happy-dom';
import { NodeHtmlMarkdown } from 'node-html-markdown';

export const htmlToMarkdown = (html: string, url: string) => {
  const window = new Window({ url });

  const document = window.document;
  document.body.innerHTML = html;

  // @ts-expect-error reason: Readability expects a Document type
  const article = new Readability(document).parse();
  const content = NodeHtmlMarkdown.translate(article?.content || '', {});

  return { ...article, content };
};
