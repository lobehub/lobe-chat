import { fetchByBrowserless } from './fetchByBrowserless';
import { htmlToMarkdown } from './htmlToMarkdown';

export const crawler = async ({ url }: { url: string }) => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const result = htmlToMarkdown(html, url);

    console.log('content:', result);
    // if the content is not empty, just return
    if (!!result.content)
      return { content: result.content, title: result?.title, url, website: result?.siteName };
  } catch (error) {
    console.error(error);
  }

  // if the content is empty, use browserless to fetch
  return fetchByBrowserless({ url });
};
