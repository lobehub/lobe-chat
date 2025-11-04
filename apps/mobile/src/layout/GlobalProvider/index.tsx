import { PropsWithChildren } from 'react';

import I18n from './I18n';
import Interaction from './Interaction';
import Navigation from './Navigation';
import Query from './Query';
import Theme from './Theme';

/**
 * Global Provider
 * Combines all global providers in the correct order:
 * 1. Theme - Theme and keyboard context
 * 2. Query - Data fetching and API client
 * 3. Interaction - Action sheets, portals, and toasts
 * 4. I18n - Internationalization
 * 5. Navigation - Gesture handling and bottom sheet support
 * Note: Stack navigation is defined in _layout.tsx
 */
const GlobalProvider = ({ children }: PropsWithChildren) => {
  return (
    <Theme>
      <Query>
        <Interaction>
          <I18n>
            <Navigation>{children}</Navigation>
          </I18n>
        </Interaction>
      </Query>
    </Theme>
  );
};

export default GlobalProvider;
