'use client';

import { PropsWithChildren, memo } from 'react';

export const LayoutSettingsFooterClassName = 'settings-layout-footer';

const Footer = memo<PropsWithChildren>(() => {
  // Hide footer for imoogleAI branding
  return null;
});

Footer.displayName = 'SettingFooter';

export default Footer;
