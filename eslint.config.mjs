import base from './packages/config-eslint/base.mjs';

/**
 * Repo-root catch-all ESLint config. Apps and packages override with their
 * own eslint.config.mjs (closest config wins under ESLint v9 flat-config
 * resolution). This file mainly exists so `pnpm exec lint-staged` at root
 * can lint files outside any app, such as packages/config-eslint/*.mjs.
 */
export default base;
