import { ARTIFACT_TAG_REGEX, ARTIFACT_THINKING_TAG_REGEX } from '@/const/plugin';

/**
 * Replace all line breaks in the matched `lobeArtifact` tag with an empty string
 */
export const processWithArtifact = (input: string = '') => {
  console.log('Input:', input);

  // First remove outer fenced code block if it exists
  let output = input.replace(
    /^([\S\s]*?)\s*```[^\n]*\n((?:<lobeThinking>[\S\s]*?<\/lobeThinking>\s*\n\s*)?<lobeArtifact[\S\s]*?<\/lobeArtifact>\s*)\n```\s*([\S\s]*?)$/,
    (_, before = '', content, after = '') => {
      return [before.trim(), content.trim(), after.trim()].filter(Boolean).join('\n\n');
    },
  );
  console.log('After removing outer fenced code block:', output);

  const thinkMatch = ARTIFACT_THINKING_TAG_REGEX.exec(output);

  // If the input contains the `lobeThinking` tag, replace all line breaks with an empty string
  if (thinkMatch) {
    output = output.replace(ARTIFACT_THINKING_TAG_REGEX, (match) =>
      match.replaceAll(/\r?\n|\r/g, ''),
    );
    console.log('After processing lobeThinking:', output);
  }

  // Add empty line between lobeThinking and lobeArtifact if they are adjacent
  output = output.replace(/(<\/lobeThinking>)\r?\n(<lobeArtifact)/, '$1\n\n$2');
  console.log('After adding empty line between tags:', output);

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
  console.log('After processing HTML content:', output);

  // Keep existing code blocks that are not part of lobeArtifact
  output = output.replace(
    /^([\S\s]*?)(<lobeThinking>[\S\s]*?<\/lobeThinking>\s*\n\s*<lobeArtifact[\S\s]*?<\/lobeArtifact>)([\S\s]*?)$/,
    (_, before, content, after) => {
      return [before.trim(), content.trim(), after.trim()].filter(Boolean).join('\n\n');
    },
  );
  console.log('After keeping existing code blocks:', output);

  const match = ARTIFACT_TAG_REGEX.exec(output);
  // If the input contains the `lobeArtifact` tag, replace all line breaks with an empty string
  if (match) {
    output = output.replace(ARTIFACT_TAG_REGEX, (match) => match.replaceAll(/\r?\n|\r/g, ''));
    console.log('After processing lobeArtifact:', output);
  }

  // if not match, check if it's start with <lobeArtifact but not closed
  const regex = /<lobeArtifact\b(?:(?!\/?>)[\S\s])*$/;
  if (regex.test(output)) {
    output = output.replace(regex, '<lobeArtifact>');
    console.log('After fixing unclosed lobeArtifact:', output);
  }

  console.log('Final output:', output);
  return output;
};
