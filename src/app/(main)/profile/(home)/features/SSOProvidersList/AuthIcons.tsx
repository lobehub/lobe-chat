import React from 'react';
import { Auth0, Authelia, Authentik, Casdoor, Cloudflare, Github, Logto, MicrosoftEntra, Zitadel, NextAuth } from '@lobehub/ui/icons';

const iconProps = {
    size: 32,
};

const iconComponents: { [key: string]: React.ElementType } = {
    auth0: Auth0,
    authelia: Authelia.Color,
    authentik: Authentik.Color,
    casdoor: Casdoor.Color,
    cloudflare: Cloudflare.Color,
    github: Github,
    logto: Logto.Color,
    'microsoft-entra': MicrosoftEntra.Color,
    zitadel: Zitadel.Color,
    default: NextAuth.Color,
};

const AuthIcons = (id: string) => {
    const IconComponent = iconComponents[id] || iconComponents.default;
    return <IconComponent {...iconProps} />;
};

export default AuthIcons;