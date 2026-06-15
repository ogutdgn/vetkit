import StarterKit from '@tiptap/starter-kit';

// Single source of truth for the Tiptap schema — imported by the admin editor
// and (later, R4) the public renderer so stored JSON round-trips identically.
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
