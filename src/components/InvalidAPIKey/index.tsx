import { memo } from 'react';

import { ErrorActionContainer } from '@/features/Conversation/Error/style';

import APIKeyForm from './APIKeyForm';

interface InvalidAPIKeyProps {
  id: string;
  provider?: string;
  description: string;
  bedrockDescription: string;
  onRecreate: () => void;
  onClose: () => void;
}
const InvalidAPIKey = memo<InvalidAPIKeyProps>(
  ({ id, provider, description, bedrockDescription, onRecreate, onClose }) => (
    <ErrorActionContainer>
      <APIKeyForm
        bedrockDescription={bedrockDescription}
        description={description}
        id={id}
        onClose={onClose}
        onRecreate={onRecreate}
        provider={provider}
      />
    </ErrorActionContainer>
  ),
);

export default InvalidAPIKey;
