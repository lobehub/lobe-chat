import {
  Auth0,
  Authelia,
  Authentik,
  Casdoor,
  Cloudflare,
  Github,
  Logto,
  MicrosoftEntra,
  NextAuth,
  Zitadel,
} from '@lobehub/ui/icons';
import React from 'react';

const iconProps = {
  size: 32,
};

const iconComponents: { [key: string]: React.ElementType } = {
  'auth0': Auth0,
  'authelia': Authelia.Color,
  'authentik': Authentik.Color,
  'casdoor': Casdoor.Color,
  'cloudflare': Cloudflare.Color,
  'default': NextAuth.Color,
  'github': Github,
  'logto': Logto.Color,
  'microsoft-entra-id': MicrosoftEntra.Color,
  'zitadel': Zitadel.Color,
};

const AuthIcons = (id: string) => {
  const IconComponent = iconComponents[id] || iconComponents.default;
  return <IconComponent {...iconProps} />;
};

export default AuthIcons;
