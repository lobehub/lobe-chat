const BASE_URL = 'https://api.apify.com/v2/acts/apify~website-content-crawler/run-sync';
const token = process.env.APIFY_API_KEY;

const runner = async ({ url }: { url: string }) => {
  // Prepare Actor input
  const input = {
    aggressivePrune: false,
    clickElementsCssSelector: '[aria-expanded="false"]',
    debugMode: false,
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

  const data = await fetch(`${BASE_URL}?token=${token}`, {
    body: JSON.stringify(input),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const result = await data.json();

  console.log(result);
  return { data: '没有发现内容' };
};

export default runner;
