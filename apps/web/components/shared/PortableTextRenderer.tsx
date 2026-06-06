import { PortableText, type PortableTextComponents } from 'next-sanity';

import type { BlockContent } from '@/types/sanity';

// Renders the schema's `blockContent` ruleset (CLAUDE.md §5: normal/h2/h3/
// blockquote, bullet/number lists, strong/em/link). Shared across all
// templates — typography here is deliberately neutral and token-driven.
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 leading-relaxed text-ink-700">{children}</p>,
    h2: ({ children }) => (
      <h2 className="mt-10 text-2xl font-bold tracking-tight text-ink-900">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 text-xl font-semibold tracking-tight text-ink-900">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-4 border-brand-300 pl-4 text-lg leading-relaxed text-ink-700 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1 pl-6 text-ink-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1 pl-6 text-ink-700">{children}</ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? '#';
      const newTab = (value as { newTab?: boolean } | undefined)?.newTab;
      return (
        <a
          href={href}
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
        >
          {children}
        </a>
      );
    },
  },
};

export function PortableTextRenderer({ value }: { value: BlockContent }) {
  return <PortableText value={value} components={components} />;
}
