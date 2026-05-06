export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>vetkit</h1>
      <p style={{ color: '#555', lineHeight: 1.6 }}>
        Skeleton is up. Tenant: <strong>{process.env.NEXT_PUBLIC_SITE_NAME ?? '(unset)'}</strong>. Template:{' '}
        <strong>{process.env.TEMPLATE ?? 'modern'}</strong>.
      </p>
      <p style={{ color: '#888', marginTop: '2rem', fontSize: '0.9rem' }}>
        Next.js 16.2.4 · React 19.2 · App Router · Turbopack
      </p>
    </main>
  );
}
