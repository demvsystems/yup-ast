import validate from 'sourcemap-validator';
import { readFileSync } from 'fs';
import { join } from 'path';

const BASE_PATH = join(__dirname, '..', '..');

const distCode = readFileSync(join(BASE_PATH, '/dist/index.js'), { encoding: 'utf-8' });
const distCodeMap = readFileSync(join(BASE_PATH, '/dist/index.js.map'), { encoding: 'utf-8' });

describe('source map for distribution', () => {
  it('builds a valid source map', () => {
    expect(() => validate(distCode, distCodeMap)).not.toThrow();
  });
});
