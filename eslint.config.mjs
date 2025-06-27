// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import reactHooks from 'eslint-plugin-react-hooks';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals'
    ]
  })
  // reactHooks.configs['recommended-latest']
];

export default eslintConfig;
