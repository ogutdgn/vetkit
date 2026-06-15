// Single source of truth for the rich-text contract, shared by the admin editor
// (apps/admin) and the public renderer (apps/web) so stored Tiptap JSON round-trips
// identically. React-free: the HTML renderer uses the schema-aware static renderer,
// so this stays usable from the data package without a React dependency.

import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import StarterKit from '@tiptap/starter-kit';

import type { TiptapDoc } from './schemas';

// Matches the legacy Portable-Text ruleset: h2/h3, blockquote, bullet/ordered
// lists, bold, italic, link. NO h1 (the page title is the h1 — SEO rule §5).
export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
    },
  }),
];

/**
 * Render stored Tiptap JSON to an HTML string, server-side, with the same
 * extension set the admin editor uses (so no unexpected nodes slip through).
 * Returns '' for an empty/null document.
 */
export function renderTiptapToHtml(doc: TiptapDoc | null | undefined): string {
  if (!doc) return '';
  return renderToHTMLString({ extensions: editorExtensions, content: doc as never });
}
