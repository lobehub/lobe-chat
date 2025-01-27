import { ARTIFACT_TAG_REGEX, ARTIFACT_THINKING_TAG_REGEX } from '@/const/plugin';

/**
 * Replace all line breaks in the matched `lobeArtifact` tag with an empty string
 */
export const processWithArtifact = (input: string = '') => {
  let output = input;
  const thinkMatch = ARTIFACT_THINKING_TAG_REGEX.exec(input);

  // If the input contains the `lobeThinking` tag, replace all line breaks with an empty string
  if (thinkMatch)
    output = input.replace(ARTIFACT_THINKING_TAG_REGEX, (match) =>
      match.replaceAll(/\r?\n|\r/g, ''),
    );

  // Add empty line between lobeThinking and lobeArtifact if they are adjacent
  output = output.replace(/(<\/lobeThinking>)\r?\n(<lobeArtifact)/, '$1\n\n$2');

  const match = ARTIFACT_TAG_REGEX.exec(output);
  // If the input contains the `lobeArtifact` tag, replace all line breaks with an empty string
  if (match)
    return output.replace(ARTIFACT_TAG_REGEX, (match) => match.replaceAll(/\r?\n|\r/g, ''));

  // if not match, check if it's start with <lobeArtifact but not closed
  const regex = /<lobeArtifact\b(?:(?!\/?>)[\S\s])*$/;
  if (regex.test(output)) {
    return output.replace(regex, '<lobeArtifact>');
  }

  return output;
};
