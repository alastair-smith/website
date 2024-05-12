// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

module.exports = {
  extends: ['plugin:jest-formatting/strict'],
  plugins: ['jest-formatting'],
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { plugins: ['jest-formatting'] }
);
