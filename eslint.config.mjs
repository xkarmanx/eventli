import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config'
import globals from 'globals'

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

const eslintConfig = defineConfig([
  ...compat.config({
    extends: [
      'next/core-web-vitals'
    ],
    rules: {
      'react/display-name': 'off',
      'semi': 'off'
    }
  }),
  {
    files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.{spec,test}.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  }
]);

export default eslintConfig;
