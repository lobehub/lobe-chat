import { Readability } from '@mozilla/readability';
import { Window } from 'happy-dom';
import { NodeHtmlMarkdown, type TranslatorConfigObject } from 'node-html-markdown';

import { FilterOptions } from '../type';

export const htmlToMarkdown = (
  html: string,
  { url, filterOptions }: { filterOptions: FilterOptions; url: string },
) => {
  const window = new Window({ url });

  const document = window.document;
  document.body.innerHTML = html;

  // @ts-expect-error reason: Readability expects a Document type
  const parsedContent = new Readability(document).parse();

  const useReadability = filterOptions.enableReadability ?? true;

  let htmlNode = html;

  if (useReadability && parsedContent?.content) {
    htmlNode = parsedContent?.content;
  }

  const customTranslators = (
    filterOptions.pureText
      ? {
          a: {
            postprocess: (_: string, content: string) => content,
          },
          img: {
            ignore: true,
          },
        }
      : {}
  ) as TranslatorConfigObject;

  const nodeHtmlMarkdown = new NodeHtmlMarkdown({}, customTranslators);

  const content = nodeHtmlMarkdown.translate(htmlNode);

  return { ...parsedContent, content };
};
