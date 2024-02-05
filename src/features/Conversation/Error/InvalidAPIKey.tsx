import { memo } from 'react';

import APIKeyForm from './APIKeyForm';
import { ErrorActionContainer } from './style';

interface InvalidAPIKeyProps {
  id: string;
  provider?: string;
}
const InvalidAPIKey = memo<InvalidAPIKeyProps>(({ id, provider }) => (
  <ErrorActionContainer>
    <APIKeyForm id={id} provider={provider} />
  </ErrorActionContainer>
));

export default InvalidAPIKey;
