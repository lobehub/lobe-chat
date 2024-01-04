import { memo } from 'react';

import { RenderErrorMessage } from '../types';
import APIKeyForm from './ApiKeyForm';
import { ErrorActionContainer } from './style';

const OpenAPIKey: RenderErrorMessage['Render'] = memo(({ id }) => (
  <ErrorActionContainer>
    <APIKeyForm id={id} />
  </ErrorActionContainer>
));

export default OpenAPIKey;
