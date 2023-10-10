import { memo } from 'react';

import APIKeyForm from './ApiKeyForm';
import { ErrorActionContainer } from './style';

const OpenAPIKey = memo<{ id: string }>(({ id }) => (
  <ErrorActionContainer>
    <APIKeyForm id={id} />
  </ErrorActionContainer>
));

export default OpenAPIKey;
