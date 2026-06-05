import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Base ESLint preset for the vetkit workspace.
 *
 * Pulls in:
 *   - @eslint/js recommended (baseline JS rules)
 *   - typescript-eslint recommendedTypeChecked + stylisticTypeChecked
 *     (type-aware rules; consumers must have a tsconfig.json in scope)
 *   - eslint-config-prettier (turns off formatting rules that fight Prettier)
 *
 * Targets (nextjs, react-library) extend this with their own React/Next rules.
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.sanity/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/next-env.d.ts',
      // Machine-written by `sanity typegen` — eslint --fix would drift it
      // from raw typegen output and make every regen a noisy diff.
      'packages/sanity-types/generated.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  prettierConfig,
);
