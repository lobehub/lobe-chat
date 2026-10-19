import type { BuiltinManifestResolver, BuiltinToolManifest } from '@lobechat/types';

import { PageAgentManifest } from './manifest';
import { HTML_PAGE_API_NAMES } from './types';

export const htmlPageSystemPrompt = `You are editing an HTML page: its body is one self-contained HTML document (inline CSS and JS) that the app renders as a web page in a sandboxed frame. It is not an XML node tree, and its content is not pre-loaded into this conversation.

<workflow>
1. Call readHtml to get the current HTML before any change.
2. For targeted changes call editHtml with oldString copied exactly from readHtml (including whitespace) and the replacement in newString. oldString must occur once unless replaceAll is true; add surrounding text to make it unique.
3. For a rewrite or a new page call writeHtml with the complete document.
4. Keep the page self-contained: no local file references; images as data URIs or public URLs.
</workflow>

Change only what the user asked for, and tell them what you changed.`;

const htmlPageManifest: BuiltinToolManifest = {
  ...PageAgentManifest,
  api: PageAgentManifest.api.filter((api) => HTML_PAGE_API_NAMES.includes(api.name)),
  systemRole: htmlPageSystemPrompt,
};

const richTextPageManifest: BuiltinToolManifest = {
  ...PageAgentManifest,
  api: PageAgentManifest.api.filter((api) => !HTML_PAGE_API_NAMES.includes(api.name)),
};

/**
 * Context-aware manifest for the page tool: an HTML page gets only the HTML
 * APIs and an HTML system role (the node-tree role would point the model at
 * APIs it no longer has and at XML context that is never injected); any other
 * page — or an unknown one — gets the node APIs only.
 */
export const resolvePageAgentManifest: BuiltinManifestResolver = (context) =>
  context.pageDocumentType === 'html' ? htmlPageManifest : richTextPageManifest;
