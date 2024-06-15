export default {
  plugins: [
    require.resolve('@trivago/prettier-plugin-sort-imports'),
    require.resolve('prettier-plugin-tailwindcss'),
    require.resolve('prettier-plugin-packagejson'),
  ],

  // Prettier options
  singleQuote: true,

  // @trivago/prettier-plugin-sort-imports options
  importOrder: [
    '^react$',
    '^next/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@alastair-smith/(.*)$',
    '^@/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,

  // prettier-plugin-tailwindcss options
  // TODO move tailwind config to dedicated package
  tailwindConfig: './apps/frontend/tailwind.config.cjs',
};
