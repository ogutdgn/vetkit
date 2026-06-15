'use client';

import { EditorContent, useEditor, useEditorState, type JSONContent } from '@tiptap/react';

import { editorExtensions } from '@/lib/editor/extensions';

function toolbarBtn(active: boolean | undefined): string {
  return `rounded px-2 py-1 text-sm font-medium ${
    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;
}

export function RichTextField({
  value,
  onChange,
  onBlur,
}: {
  value: JSONContent | null;
  onChange: (doc: JSONContent) => void;
  onBlur?: () => void;
}) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: value ?? '',
    // REQUIRED in the Next App Router — otherwise Tiptap throws "SSR has been
    // detected" and the editor hydration mismatches.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'ProseMirror min-h-40 px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    onBlur: onBlur ? () => onBlur() : undefined,
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor && {
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isH2: editor.isActive('heading', { level: 2 }),
        isH3: editor.isActive('heading', { level: 3 }),
        isQuote: editor.isActive('blockquote'),
        isBullet: editor.isActive('bulletList'),
        isOrdered: editor.isActive('orderedList'),
        isLink: editor.isActive('link'),
      },
  });

  if (!editor) return null;

  const setLink = () => {
    const prev = (editor.getAttributes('link').href as string | undefined) ?? '';
    const url = window.prompt('Bağlantı adresi (boş bırakırsanız kaldırılır)', prev);
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  return (
    <div className="rounded-md border border-slate-300 focus-within:border-slate-500">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 p-1">
        <button
          type="button"
          className={toolbarBtn(state?.isBold)}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={`italic ${toolbarBtn(state?.isItalic)}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={toolbarBtn(state?.isH2)}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={toolbarBtn(state?.isH3)}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          className={toolbarBtn(state?.isQuote)}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </button>
        <button
          type="button"
          className={toolbarBtn(state?.isBullet)}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Liste
        </button>
        <button
          type="button"
          className={toolbarBtn(state?.isOrdered)}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Liste
        </button>
        <button type="button" className={toolbarBtn(state?.isLink)} onClick={setLink}>
          Bağlantı
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
