// @vitest-environment node
import { Console } from 'node:console';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { expect } from 'vitest';

import { dataSync } from '@/database/client/core';

import { CsVLoader } from '../index';

describe('CSVLoader', () => {
  it('should run', async () => {
    const content = fs.readFileSync(join(__dirname, `./demo.csv`), 'utf-8');

    const fileBlob = new Blob([Buffer.from(content)]);

    const data = await CsVLoader(fileBlob);

    expect(data).toMatchSnapshot();
  });
});
