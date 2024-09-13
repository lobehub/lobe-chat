'use client';

import { UserProfile } from '@clerk/nextjs';
import { ElementsConfig } from '@clerk/types';
import { createStyles } from 'antd-style';
import { memo } from 'react';

export const useStyles = createStyles(
  ({ css, token, cx }, mobile: boolean) =>
    ({
      cardBox: css`
        width: 100%;
        max-width: unset;
        height: 100%;

        border: unset;
        border-radius: unset;
        box-shadow: unset;
      `,
      footer: cx(
        mobile &&
          css`
            display: none;
          `,
      ),
      navbar: css`
        flex: none;

        width: 280px;
        max-width: unset;
        margin-inline-end: 0;
        padding-block: 24px 16px;
        padding-inline: 12px;

        background: ${token.colorBgContainer};
        border-inline-end: 1px solid ${token.colorSplit};
      `,
      navbarMobileMenuRow: cx(
        mobile &&
          css`
            display: none;
          `,
      ),
      pageScrollBox: css`
        align-self: center;
        width: 100%;
        max-width: 1024px;
      `,
      rootBox: css`
        width: 100%;
        height: 100%;
      `,
      scrollBox: css`
        background: ${token.colorBgLayout};
        border: unset;
        border-radius: unset;
      `,
    }) as Partial<{
      // eslint-disable-next-line unused-imports/no-unused-vars
      [k in keyof ElementsConfig]: any;
    }>,
);

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { styles } = useStyles(mobile);

  return (
    <UserProfile
      appearance={{
        elements: styles,
      }}
    />
  );
});

export default Client;
