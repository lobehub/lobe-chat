export type DataResults = DataItem[];

export interface DataItem {
  crawl: Crawl;
  markdown: string;
  metadata: Metadata;
  screenshotUrl: any;
  text: string;
  url: string;
}

export interface Crawl {
  depth: number;
  httpStatusCode: number;
  loadedTime: string;
  loadedUrl: string;
  referrerUrl: string;
}

export interface Metadata {
  author: any;
  canonicalUrl: string;
  description: string;
  keywords: string;
  languageCode: string;
  title: string;
}

const BASE_URL =
  'https://api.apify.com/v2/acts/apify~website-content-crawler/run-sync-get-dataset-items';
const token = process.env.APIFY_API_KEY;

const runner = async ({ url }: { url: string }) => {
  // Prepare Actor input
  const input = {
    aggressivePrune: false,
    clickElementsCssSelector: '[aria-expanded="false"]',
    debugMode: false,
    dynamicContentWaitSecs: 3,
    proxyConfiguration: {
      useApifyProxy: true,
    },
    removeCookieWarnings: true,
    removeElementsCssSelector:
      'nav, footer, script, style, noscript, svg,\n[role="alert"],\n[role="banner"],\n[role="dialog"],\n[role="alertdialog"],\n[role="region"][aria-label*="skip" i],\n[aria-modal="true"]',
    saveFiles: false,
    saveHtml: false,
    saveMarkdown: true,
    saveScreenshots: false,
    startUrls: [{ url }],
  };

  try {
    const data = await fetch(`${BASE_URL}?token=${token}`, {
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const result = (await data.json()) as DataResults;

    const item = result[0];
    return {
      content: item.markdown,
      title: item.metadata.title,
      url: item.url,
    };
  } catch (error) {
    console.error(error);
    return { content: '抓取失败', errorMessage: (error as any).message };
  }
};

export default runner;
