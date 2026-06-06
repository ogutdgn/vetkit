import type { ThemeComponents } from '@/types/template';

/**
 * Build-time template selection (CLAUDE.md §2.4/§6). Pages call this once,
 * destructure components, render — tree-shaking keeps the other templates out
 * of the bundle. `classic`/`premium` throw instead of importing because their
 * folders hold only placeholder READMEs (Phase 2/3); a static import of a
 * missing module would fail the build for everyone.
 */
export async function getTemplate(): Promise<ThemeComponents> {
  const name = process.env.TEMPLATE ?? 'modern';
  switch (name) {
    case 'modern':
      return (await import('@/templates/modern')).default;
    case 'classic':
    case 'premium':
      throw new Error(
        `Template "${name}" is not yet implemented (see templates/${name}/README.md).`,
      );
    default:
      throw new Error(`Unknown template: ${name}`);
  }
}
