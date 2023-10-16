import { RenderErrorMessage } from '@lobehub/ui';
import { memo } from 'react';

import APIKeyForm from './ApiKeyForm';
import { ErrorActionContainer } from './style';

const OpenAPIKey: RenderErrorMessage = memo(({ id }) => (
  <ErrorActionContainer>
    <APIKeyForm id={id} />
  </ErrorActionContainer>
));

export default OpenAPIKey;
