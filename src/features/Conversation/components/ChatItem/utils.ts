import { ARTIFACT_TAG_REGEX } from '@/const/plugin';

/**
 * Replace all line breaks in the matched `lobeArtifact` tag with an empty string
 */
export const processWithArtifact = (input: string = '') => {
  const match = ARTIFACT_TAG_REGEX.exec(input);

  // If the input contains the `lobeArtifact` tag, replace all line breaks with an empty string
  if (match)
    return input.replaceAll(ARTIFACT_TAG_REGEX, (match) => match.replaceAll(/\r?\n|\r/g, ''));

  // if not match, check if it's start with <lobeArtifact but not closed
  const regex = /<lobeArtifact\b(?:(?!\/?>)[\S\s])*$/;
  if (regex.test(input)) {
    return input.replace(regex, '<lobeArtifact>');
  }

  return input;
};
