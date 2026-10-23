// Match sandboxStorage's trimmed name schema without discarding the user's draft.
export const ENVIRONMENT_NAME_MAX_LENGTH = 255;

export const validateEnvironmentName = (name: string): 'required' | 'tooLong' | undefined => {
  if (!name.trim()) return 'required';
  if (name.trim().length > ENVIRONMENT_NAME_MAX_LENGTH) return 'tooLong';
  return undefined;
};

export type CreateEnvironmentFailure = 'createFailed' | 'duplicateName';

export const toCreateEnvironmentFailure = (cause: unknown): CreateEnvironmentFailure =>
  (cause as { message?: string } | undefined)?.message === 'DUPLICATE_ENVIRONMENT_NAME'
    ? 'duplicateName'
    : 'createFailed';

export interface CreateEnvironmentFeedback {
  /** A problem with the name itself, fixed by editing the field. */
  field?: 'duplicateName' | 'tooLong';
  /** A failure the name did not cause, so it must not mark the field invalid. */
  form?: 'createFailed';
}

export const getCreateEnvironmentFeedback = (
  name: string,
  failure: CreateEnvironmentFailure | undefined,
): CreateEnvironmentFeedback => {
  if (validateEnvironmentName(name) === 'tooLong') return { field: 'tooLong' };
  if (failure === 'duplicateName') return { field: 'duplicateName' };
  if (failure === 'createFailed') return { form: 'createFailed' };
  return {};
};
