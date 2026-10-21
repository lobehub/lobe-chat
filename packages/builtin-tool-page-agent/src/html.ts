/**
 * Editing an HTML page (`custom/html`). Its body is a self-contained HTML
 * document rendered in a sandboxed frame, not a Lexical document, so it is read
 * and written as raw text. The server runtime and the client executor share
 * these semantics.
 */

export interface ReadHtmlArgs {}

export interface EditHtmlArgs {
  /** Text to put in its place. */
  newString: string;
  /** Exact text to find in the current HTML, including whitespace. */
  oldString: string;
  /** Replace every occurrence; otherwise `oldString` must occur exactly once. */
  replaceAll?: boolean;
}

export interface WriteHtmlArgs {
  /** The complete new HTML document. */
  html: string;
}

export interface ReadHtmlState {
  charCount: number;
  html: string;
}

export interface EditHtmlState {
  charCount: number;
  replacementCount: number;
}

export interface WriteHtmlState {
  charCount: number;
}

export class HtmlEditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HtmlEditError';
  }
}

const countOccurrences = (text: string, search: string) => {
  let count = 0;
  let index = text.indexOf(search);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(search, index + search.length);
  }
  return count;
};

/**
 * Apply an exact string replacement. An edit that matches nothing, or matches
 * more than once without `replaceAll`, is rejected rather than guessed at.
 */
export const applyHtmlEdit = (
  html: string,
  { newString, oldString, replaceAll }: EditHtmlArgs,
): { html: string; replacementCount: number } => {
  if (!oldString) throw new HtmlEditError('oldString must not be empty.');
  if (oldString === newString) throw new HtmlEditError('oldString and newString are identical.');

  const count = countOccurrences(html, oldString);
  if (count === 0) {
    throw new HtmlEditError(
      'oldString was not found in the current HTML. Call readHtml and copy the exact text, including whitespace.',
    );
  }
  if (count > 1 && !replaceAll) {
    throw new HtmlEditError(
      `oldString occurs ${count} times. Include more surrounding text to make it unique, or set replaceAll.`,
    );
  }

  return {
    html: replaceAll
      ? html.split(oldString).join(newString)
      : html.replace(oldString, () => newString),
    replacementCount: replaceAll ? count : 1,
  };
};

export const HTML_PAGE_TOOL_HINT =
  'This page is an HTML page: its body is one self-contained HTML document. ' +
  'Use readHtml, editHtml and writeHtml; the node-based APIs (initPage, getPageContent, modifyNodes, replaceText) do not apply to it.';

export const RICH_TEXT_PAGE_TOOL_HINT =
  'This page is a rich-text page, not an HTML page: readHtml, editHtml and writeHtml do not apply. Use the node-based APIs.';
