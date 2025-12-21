import { ARTIFACT_TAG_REGEX, ARTIFACT_THINKING_TAG_REGEX } from '@lobechat/const';

/**
 * Replace all line breaks in the matched `lobeArtifact` tag with an empty string
 */
export const processWithArtifact = (input: string = '') => {
  // First remove outer fenced code block if it exists
  let output = input.replace(
    /^([\S\s]*?)\s*```[^\n]*\n((?:<lobeThinking>[\S\s]*?<\/lobeThinking>\s*\n\s*)?<lobeArtifact[\S\s]*?<\/lobeArtifact>\s*)\n```\s*([\S\s]*?)$/,
    (_, before = '', content, after = '') => {
      return [before.trim(), content.trim(), after.trim()].filter(Boolean).join('\n\n');
    },
  );

  const thinkMatch = ARTIFACT_THINKING_TAG_REGEX.exec(output);

  // If the input contains the `lobeThinking` tag, replace all line breaks with an empty string
  if (thinkMatch) {
    output = output.replace(ARTIFACT_THINKING_TAG_REGEX, (match) =>
      match.replaceAll(/\r?\n|\r/g, ''),
    );
  }

  // Add empty line between lobeThinking and lobeArtifact if they are adjacent
  // Support both cases: with line break (e.g. from other models) and without (e.g. from Gemini)
  output = output.replace(/(<\/lobeThinking>)(?:\r?\n)?(<lobeArtifact)/, '$1\n\n$2');

  // Remove fenced code block between lobeArtifact and HTML content
  output = output.replace(
    /(<lobeArtifact[^>]*>)\s*```[^\n]*\n([\S\s]*?)(```\n)?(<\/lobeArtifact>)/,
    (_, start, content, __, end) => {
      if (content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')) {
        return start + content.trim() + end;
      }
      return start + content + (__ || '') + end;
    },
  );

  // Keep existing code blocks that are not part of lobeArtifact
  output = output.replace(
    /^([\S\s]*?)(<lobeThinking>[\S\s]*?<\/lobeThinking>\s*\n\s*<lobeArtifact[\S\s]*?<\/lobeArtifact>)([\S\s]*?)$/,
    (_, before, content, after) => {
      return [before.trim(), content.trim(), after.trim()].filter(Boolean).join('\n\n');
    },
  );

  const match = ARTIFACT_TAG_REGEX.exec(output);
  // If the input contains the `lobeArtifact` tag, replace all line breaks with an empty string
  if (match) {
    output = output.replace(ARTIFACT_TAG_REGEX, (match) => match.replaceAll(/\r?\n|\r/g, ''));
  }

  // if not match, check if it's start with <lobeArtifact but not closed
  const regex = /<lobeArtifact\b(?:(?!\/?>)[\S\s])*$/;
  if (regex.test(output)) {
    output = output.replace(regex, '<lobeArtifact>');
  }

  return output;
};

// Preprocessing function: ensure two line breaks before and after think tags
export const normalizeThinkTags = (input: string) => {
  return (
    input
      // Ensure two line breaks before and after <think> tag
      .replaceAll(/([^\n])\s*<think>/g, '$1\n\n<think>')
      .replaceAll(/<think>\s*([^\n])/g, '<think>\n\n$1')
      // Ensure two line breaks before and after </think> tag
      .replaceAll(/([^\n])\s*<\/think>/g, '$1\n\n</think>')
      .replaceAll(/<\/think>\s*([^\n])/g, '</think>\n\n$1')
      // Handle possible extra line breaks
      .replaceAll(/\n{3,}/g, '\n\n')
  );
};
