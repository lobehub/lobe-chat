import { AdapterAuthenticator, AdapterUser } from 'next-auth/adapters';

import { NewUser } from '@/database/server/schemas/lobechat';

export const mapAdapterUserToLobeUser = (adapterUser: AdapterUser): NewUser => {
  const { id, name, email, image, emailVerified } = adapterUser;
  return {
    avatar: image,
    email,
    emailVerified: emailVerified ? new Date(emailVerified) : undefined,
    id,
    username: name,
  };
};

export const partialMapAdapterUserToLobeUser = ({
  id,
  name,
  email,
  image,
  emailVerified,
}: Partial<AdapterUser>): Partial<NewUser> => {
  return {
    avatar: image,
    email,
    emailVerified: emailVerified ? new Date(emailVerified) : undefined,
    id,
    username: name,
  };
};

export const mapLobeUserToAdapterUser = (lobeUser: NewUser | undefined): AdapterUser | null => {
  if (!lobeUser?.email) return null;
  const { id, username, email, avatar, emailVerified } = lobeUser;
  return {
    email,
    emailVerified: emailVerified ? new Date(emailVerified) : null,
    id,
    image: avatar,
    name: username,
  };
};

type AuthenticatorQueryResult = {
  counter: number;
  credentialBackedUp: boolean;
  credentialDeviceType: string;
  credentialID: string;
  credentialPublicKey: string;
  providerAccountId: string;
  transports: string | null;
  userId: string;
};

export const mapAuthenticatorQueryResutlToAdapterAuthenticator = (
  authenticator: AuthenticatorQueryResult,
): AdapterAuthenticator => {
  return {
    ...authenticator,
    transports: authenticator?.transports ?? undefined,
  };
};
