export default {
  danger: {
    clear: {
      action: 'Clear Now',
      confirm: 'Confirm clear all chat and settings data?',
      desc: 'Clear all chat and settings data',
      title: 'Clear All Data',
    },
    reset: {
      action: 'Reset Now',
      confirm: 'Confirm reset all settings?',
      currentVersion: 'Current Version',
      desc: 'Reset all settings to default values',
      title: 'Reset All Settings',
    },
  },
  header: 'Settings',
  settingChat: {
    compressThreshold: {
      desc: 'When the uncompressed history message exceeds this value, it will be compressed',
      title: 'History Message Length Compression Threshold',
    },
    historyCount: {
      desc: 'Number of history messages carried in each request',
      title: 'Number of History Messages',
    },
    inputTemplate: {
      desc: 'The latest user message will be filled into this template',
      title: 'User Input Template',
    },
    maxTokens: {
      desc: 'The maximum number of tokens used for each interaction',
      title: 'Max Tokens per Response',
    },
    sendKey: {
      title: 'Send Key',
    },
    title: 'Chat Settings',
  },
  settingModel: {
    frequencyPenalty: {
      desc: 'The higher the value, the more likely it is to reduce repeated words',
      title: 'Frequency Penalty (frequency_penalty)',
    },
    model: {
      title: 'Model',
    },
    presencePenalty: {
      desc: 'The higher the value, the more likely it is to expand to new topics',
      title: 'Topic Freshness (presence_penalty)',
    },
    temperature: {
      desc: 'The higher the value, the more random the response',
      title: 'Randomness (temperature)',
    },
    title: 'Model Settings',
    topP: {
      desc: 'Similar to randomness, but do not change it together with randomness',
      title: 'Nucleus Sampling (top_p)',
    },
  },
  settingOpenAI: {
    endpoint: {
      desc: 'In addition to the default address, it must include http(s)://',
      title: 'API Endpoint',
    },
    title: 'OpenAI Settings',
    token: {
      desc: 'Use your own key to bypass password access restrictions',
      placeholder: 'OpenAI API Key',
      title: 'API Key',
    },
  },
  settingSystem: {
    accessCode: {
      desc: 'Encryption access has been enabled by the administrator',
      placeholder: 'Please enter the access code',
      title: 'Access Code',
    },
    title: 'System Settings',
  },
  settingTheme: {
    avatar: {
      desc: 'Supports URL / Base64 / Emoji',
      title: 'Avatar',
    },
    fontSize: {
      desc: 'Font size of chat content',
      title: 'Font Size',
    },
    lang: {
      all: 'All Languages',
      name: 'Language Settings',
    },
    title: 'Theme Settings',
  },
};
