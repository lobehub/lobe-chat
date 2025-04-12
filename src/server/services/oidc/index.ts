import { createContextForInteractionDetails } from '@/libs/oidc-provider/http-adapter';
import { OIDCProvider } from '@/libs/oidc-provider/provider';

import { getOIDCProvider } from './oidcProvider';

export class OIDCService {
  private provider: OIDCProvider;

  constructor(provider: OIDCProvider) {
    this.provider = provider;
  }
  static async initialize() {
    const provider = await getOIDCProvider();

    return new OIDCService(provider);
  }

  async getInteractionDetails(uid: string) {
    const { req, res } = await createContextForInteractionDetails(uid);
    return this.provider.interactionDetails(req, res);
  }

  async getInteractionResult(uid: string, result: any) {
    const { req, res } = await createContextForInteractionDetails(uid);
    return this.provider.interactionResult(req, res, result, { mergeWithLastSubmission: true });
  }
}

export { getOIDCProvider } from './oidcProvider';
