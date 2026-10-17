import type { UnderstandingProvider } from '../types';
import { githubUnderstandingProvider } from './github';
import { gmailUnderstandingProvider } from './gmail';
import { collectLinearUnderstanding, linearUnderstandingProvider } from './linear';
import { notionUnderstandingProvider } from './notion';
import { twitterUnderstandingProvider } from './twitter';

export const understandingProviders = [
  githubUnderstandingProvider,
  gmailUnderstandingProvider,
  notionUnderstandingProvider,
  twitterUnderstandingProvider,
] as const satisfies readonly UnderstandingProvider[];

export const understandingProviderMap = new Map<string, UnderstandingProvider>(
  understandingProviders.map((provider) => [provider.id, provider]),
);

/**
 * Collectors outside the personal Understanding list above: available to other
 * analyses (such as a team's) without being offered in personal onboarding.
 */
export const additionalUnderstandingProviders = [
  linearUnderstandingProvider,
] as const satisfies readonly UnderstandingProvider[];

export {
  collectLinearUnderstanding,
  githubUnderstandingProvider,
  gmailUnderstandingProvider,
  linearUnderstandingProvider,
  notionUnderstandingProvider,
  twitterUnderstandingProvider,
};
