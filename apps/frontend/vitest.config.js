const path = require('path');
const react = require('@vitejs/plugin-react');

export default {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest-setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
};
