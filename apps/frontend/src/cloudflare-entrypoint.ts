import nextOnPagesHandler from '@cloudflare/next-on-pages/fetch-handler';
import { instrument } from '@microlabs/otel-cf-workers';

import { telemetryConfig } from '@/telemetry';

type fetchArgs = Parameters<(typeof nextOnPagesHandler)['fetch']>;

const handler = {
  async fetch(
    request: fetchArgs[0],
    env: fetchArgs[1],
    ctx: fetchArgs[2]
  ): Promise<Response> {
    const response = await nextOnPagesHandler.fetch(request, env, ctx);

    return response;
  },
};

export default instrument(handler, telemetryConfig);
