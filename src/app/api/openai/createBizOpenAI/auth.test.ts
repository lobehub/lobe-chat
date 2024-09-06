// @vitest-environment node
import { checkAuth } from './auth';

describe('ACCESS_CODE', () => {
  let auth = false;

  beforeEach(() => {
    auth = false;
    process.env.ACCESS_CODE = undefined;
    // Reset environment variables before each test case
    vi.restoreAllMocks();
  });

  it('set multiple access codes', () => {
    process.env.ACCESS_CODE = ',code1,code2,code3';
    ({ auth } = checkAuth({ accessCode: 'code1' }));
    expect(auth).toBe(true);
    ({ auth } = checkAuth({ accessCode: 'code2' }));
    expect(auth).toBe(true);
    ({ auth } = checkAuth({ accessCode: 'code1,code2' }));
    expect(auth).toBe(false);
  });

  it('set individual access code', () => {
    process.env.ACCESS_CODE = 'code1';
    ({ auth } = checkAuth({ accessCode: 'code1' }));
    expect(auth).toBe(true);
    ({ auth } = checkAuth({ accessCode: 'code2' }));
    expect(auth).toBe(false);
  });

  it('no access code', () => {
    delete process.env.ACCESS_CODE;
    ({ auth } = checkAuth({ accessCode: 'code1' }));
    expect(auth).toBe(true);
    ({ auth } = checkAuth({}));
    expect(auth).toBe(true);
  });

  it('empty access code', () => {
    process.env.ACCESS_CODE = '';
    ({ auth } = checkAuth({ accessCode: 'code1' }));
    expect(auth).toBe(true);
    ({ auth } = checkAuth({}));
    expect(auth).toBe(true);

    process.env.ACCESS_CODE = ',,';
    ({ auth } = checkAuth({ accessCode: 'code1' }));
    expect(auth).toBe(true);
    ({ auth } = checkAuth({}));
    expect(auth).toBe(true);
  });
});
