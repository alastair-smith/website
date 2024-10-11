import { vi } from 'vitest';

import { EnvironmentVariables } from '@/env';

const environmentVariables: EnvironmentVariables = {
  GIT_BRANCH_NAME: 'test',
  ENVIRONMENT: 'production',
  NEW_RELIC_LICENSE_KEY: 'new-relic-api-key',
  VERSION: '000',
};

vi.mock('@cloudflare/next-on-pages', () => ({
  getRequestContext: vi.fn().mockReturnValue({ env: environmentVariables }),
}));
