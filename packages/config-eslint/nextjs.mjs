import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import base from './base.mjs';

/**
 * Next.js target preset. Extends the base with:
 *   - @next/eslint-plugin-next recommended + core-web-vitals
 *   - eslint-plugin-react recommended + jsx-runtime (React 19 / new JSX transform)
 *   - eslint-plugin-react-hooks recommended
 *
 * Used by apps/web/eslint.config.mjs.
 */
export default tseslint.config(...base, {
  files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
  plugins: {
    '@next/next': nextPlugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
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
