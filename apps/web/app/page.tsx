export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-8 py-16">
      <h1 className="mb-2 text-3xl font-semibold text-brand-600">vetkit</h1>
      <p className="leading-relaxed text-ink-700">
        Skeleton is up. Tenant:{' '}
        <strong className="text-ink-900">{process.env.NEXT_PUBLIC_SITE_NAME ?? '(unset)'}</strong>.{' '}
        Template:{' '}
        <strong className="text-ink-900">{process.env.TEMPLATE ?? 'modern'}</strong>.
      </p>
      <p className="mt-8 text-sm text-ink-500">
        Next.js 16.2.4 · React 19.2 · App Router · Turbopack
      </p>
    </main>
  );
}
