export interface LobeUser {
  avatar?: string;
  firstName?: string | null;
  fullName?: string | null;
  id: string;
  latestName?: string | null;
  username?: string | null;
}

export interface UserAuthState {
  /**
   * @deprecated
   */
  avatar?: string;
  isSignedIn?: boolean;
  user?: LobeUser;
  userId?: string;
}

export const initialAuthState: UserAuthState = {};
