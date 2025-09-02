// Only current supported models and workflows, custom additions not included
export const supportedFixture = {
  // Validation helper functions
  isSupported: (model: string) => {
    const allModels = [...supportedFixture.models.flux, ...supportedFixture.models.sd];
    return allModels.includes(model);
  },

  models: {
    flux: ['flux-dev', 'flux-schnell', 'flux-kontext', 'flux-krea'],
    sd: ['sd15', 'sdxl', 'sd35'],
  },

  workflows: ['flux-dev', 'flux-schnell', 'flux-kontext', 'flux-krea', 'simple-sd', 'sd35'],
};
