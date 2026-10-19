// OSS default: no workspace roles, so the single user administers everything.
// Cloud overrides this with the real workspace-role lookup.
export const useIsWorkspaceAdmin = (): boolean => true;
