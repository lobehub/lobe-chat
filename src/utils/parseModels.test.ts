import { describe, expect, it } from 'vitest';

import { parseModelString } from './parseModels';

describe('parseModelString', () => {
  it('custom deletion, addition, and renaming of models', () => {
    const result = parseModelString(
      '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo,gpt-4-1106-preview=gpt-4-32k',
    );

    expect(result).toMatchSnapshot();
  });

  it('duplicate naming model', () => {
    const result = parseModelString('gpt-4-1106-preview=gpt-4-turbo，gpt-4-1106-preview=gpt-4-32k');
    expect(result).toMatchSnapshot();
  });

  it('only add the model', () => {
    const result = parseModelString('model1,model2,model3，model4');

    expect(result).toMatchSnapshot();
  });
});
