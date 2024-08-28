declare module '@cloudflare/next-on-pages/fetch-handler' {
  export const fetch: (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) => Promise<Response>;
}
