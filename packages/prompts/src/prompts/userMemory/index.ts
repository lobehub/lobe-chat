/**
 * User memory item interfaces
 */
export interface UserMemoryContextItem {
  description?: string | null;
  id?: string;
  title?: string | null;
}

export interface UserMemoryExperienceItem {
  id?: string;
  keyLearning?: string | null;
  situation?: string | null;
}

export interface UserMemoryPreferenceItem {
  conclusionDirectives?: string | null;
  id?: string;
}

export interface UserMemoryData {
  contexts?: UserMemoryContextItem[];
  experiences?: UserMemoryExperienceItem[];
  preferences?: UserMemoryPreferenceItem[];
}

export interface PromptUserMemoryOptions {
  /** When the memories were fetched */
  fetchedAt?: number;
  /** User memories data */
  memories: UserMemoryData;
}

/**
 * Formats a single context memory item
 * title as attribute, description as children
 */
const formatContextItem = (item: UserMemoryContextItem): string => {
  return `<context id="${item.id || ''}" title="${item.title || ''}">${item.description || ''}</context>`;
};

/**
 * Formats a single experience memory item
 */
const formatExperienceItem = (item: UserMemoryExperienceItem): string => {
  return `<experience id="${item.id || ''}">
<situation>${item.situation || ''}</situation>
<key_learning>${item.keyLearning || ''}</key_learning>
</experience>`;
};

/**
 * Formats a single preference memory item
 */
const formatPreferenceItem = (item: UserMemoryPreferenceItem): string => {
  return item.conclusionDirectives
    ? `<preference id="${item.id || ''}">${item.conclusionDirectives}</preference>`
    : '';
};

/**
 * Format user memories as unified XML prompt
 *
 * The memories are organized into three categories:
 * - contexts: Background information about the user's situation
 * - experiences: Past interactions and learnings
 * - preferences: User's stated preferences and directives
 */
export const promptUserMemory = ({ memories, fetchedAt }: PromptUserMemoryOptions): string => {
  const contexts = memories.contexts || [];
  const experiences = memories.experiences || [];
  const preferences = memories.preferences || [];

  const hasContexts = contexts.length > 0;
  const hasExperiences = experiences.length > 0;
  const hasPreferences = preferences.length > 0;

  // If no memories at all, return empty
  if (!hasContexts && !hasExperiences && !hasPreferences) {
    return '';
  }

  const contentParts: string[] = [];

  // Add instruction
  contentParts.push(
    '<instruction>The following are memories about this user retrieved from previous conversations. Use this information to personalize your responses and maintain continuity.</instruction>',
  );

  // Add contexts section
  if (hasContexts) {
    const contextsXml = contexts.map((item) => formatContextItem(item)).join('\n');
    contentParts.push(`<contexts count="${contexts.length}">
${contextsXml}
</contexts>`);
  }

  // Add experiences section
  if (hasExperiences) {
    const experiencesXml = experiences.map((item) => formatExperienceItem(item)).join('\n');
    contentParts.push(`<experiences count="${experiences.length}">
${experiencesXml}
</experiences>`);
  }

  // Add preferences section
  if (hasPreferences) {
    const preferencesXml = preferences.map((item) => formatPreferenceItem(item)).join('\n');
    contentParts.push(`<preferences count="${preferences.length}">
${preferencesXml}
</preferences>`);
  }

  // Format timestamp in natural readable format with timezone (e.g., "Jan 15, 2024, 10:00 AM UTC")
  const date = fetchedAt ? new Date(fetchedAt) : new Date();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const timestamp = `${month} ${day}, ${year}, ${hour12}:00 ${ampm} UTC`;

  return `<user_memory retrieved_at="${timestamp}">
${contentParts.join('\n')}
</user_memory>`;
};
