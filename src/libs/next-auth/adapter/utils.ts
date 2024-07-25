import { AdapterAuthenticator, AdapterUser } from 'next-auth/adapters';

import { NewUser } from '@/database/server/schemas/lobechat';

export const mapAdapterUserToLobeUser = (adapterUser: AdapterUser): NewUser => {
  const { id, email, name, image, emailVerified, username } = adapterUser;
  return {
    avatar: image,
    email,
    emailVerifiedAt: emailVerified ? new Date(emailVerified) : undefined,
    fullName: name,
    id,
    username,
  };
};

export const partialMapAdapterUserToLobeUser = ({
  id,
  name,
  email,
  image,
  emailVerified,
  username,
}: Partial<AdapterUser>): Partial<NewUser> => {
  return {
    avatar: image,
    email,
    emailVerifiedAt: emailVerified ? new Date(emailVerified) : undefined,
    fullName: name,
    id,
    username,
  };
};

export const mapLobeUserToAdapterUser = (lobeUser: NewUser): AdapterUser => {
  const { id, fullName, email, avatar, emailVerifiedAt, username } = lobeUser;
  return {
    // In LobeUser, email is nullable
    email: email ?? '',
    emailVerified: emailVerifiedAt ? new Date(emailVerifiedAt) : null,
    id,
    image: avatar,
    name: fullName,
    username: username ?? undefined,
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
