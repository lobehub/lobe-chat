import { ARTIFACT_TAG_REGEX, ARTIFACT_THINKING_TAG_REGEX } from '@/const/plugin';

/**
 * Replace all line breaks in the matched `lobeArtifact` tag with an empty string
 */
export const isContainArtifact = (input: string = '') => {
  const match = ARTIFACT_TAG_REGEX.exec(input);

  if (!match) return input;

  return input.replaceAll(ARTIFACT_TAG_REGEX, (match) => match.replaceAll(/\r?\n|\r/g, ''));
};

/**
 * Replace all line breaks in the matched `lobeArtifact` tag with an empty string
 */
export const isContainThinking = (input: string = '') => {
  const match = ARTIFACT_THINKING_TAG_REGEX.exec(input);

  if (!match) return input;

  return input.replaceAll(ARTIFACT_TAG_REGEX, (match) => match.replaceAll(/\r?\n|\r/g, ''));
};
