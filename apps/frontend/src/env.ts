import { z } from 'zod';

const environmentVariableSchema = z.object({
  GIT_BRANCH_NAME: z
    .string()
    .min(1)
    .default('local')
    .describe('Git branch that has been deployed'),
  ENVIRONMENT: z
    .enum(['local', 'development', 'production'])
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

const getEnvironmentVariables = () => {
  return environmentVariableSchema.parse(process.env);
};

/**
 * Validated server environment variables
 */
const environmentVariables = getEnvironmentVariables();
export default environmentVariables;
