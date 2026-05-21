import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import base from './base.mjs';

/**
 * Generic React library preset (no Next.js coupling). Used by apps/studio
 * which is a Sanity Studio React app, not a Next.js app.
 */
export default tseslint.config(...base, {
  files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    ...reactPlugin.configs.recommended.rules,
    ...reactPlugin.configs['jsx-runtime'].rules,
    ...reactHooksPlugin.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: { version: 'detect' },
  },
});
