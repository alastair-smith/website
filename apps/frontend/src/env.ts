import { getRequestContext } from '@cloudflare/next-on-pages';
import { z } from 'zod';

const environmentVariableSchema = z.object({
  GIT_BRANCH_NAME: z
    .string()
    .min(1)
    .default('local')
    .describe('Git branch that has been deployed'),
  ENVIRONMENT: z
    .enum(['local', 'preview', 'production'])
    .describe('Environment that has been deployed to'),
  NEW_RELIC_LICENSE_KEY: z
    .string()
    .min(1)
    .describe('API key for sending telemetry to New Relic'),
  VERSION: z
    .string()
    .min(1)
    .default('local')
    .describe('The version of the app'),
});

/**
 * Return validated server environment variables
 */
export const getEnvironmentVariables = () => {
  const env =
    process.env.NODE_ENV === 'development'
      ? process.env
      : getRequestContext().env;
  return environmentVariableSchema.parse(env);
};

export type EnvironmentVariables = ReturnType<typeof getEnvironmentVariables>;
