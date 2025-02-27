import { fetchByBrowserless } from './fetchByBrowserless';
import { htmlToMarkdown } from './htmlToMarkdown';

export const crawler = async ({ url }: { url: string }) => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const article = htmlToMarkdown(html, url);

    // if the content is not empty, just return
    if (!!article.content)
      return { content: article.content, title: article?.title, url, website: article?.siteName };
  } catch (error) {
    console.error(error);
  }

  // if the content is empty, use browserless to fetch
  return fetchByBrowserless({ url });
};
