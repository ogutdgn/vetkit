'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { uploadMedia } from '@/app/(app)/media/actions';

export function MediaPicker({
  value,
  initialUrl,
  onChange,
}: {
  value: string | null;
  initialUrl?: string | null;
  onChange: (mediaId: string | null) => void;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      // Measure real dimensions client-side (no server image lib needed).
      let width = 0;
      let height = 0;
      try {
        const bmp = await createImageBitmap(file);
        width = bmp.width;
        height = bmp.height;
        bmp.close();
      } catch {
        // non-decodable file — upload without dimensions
      }

      const fd = new FormData();
      fd.set('file', file);
      if (width) fd.set('width', String(width));
      if (height) fd.set('height', String(height));

      const res = await uploadMedia(fd);
      if (!res.ok || !res.mediaId) {
        setError(res.error ?? 'Yükleme başarısız.');
        return;
      }
      onChange(res.mediaId);
      setUrl(res.publicUrl ?? null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-4">
      {url ? (
        // Internal admin thumbnail — unoptimized avoids needing remotePatterns
        // config for the Storage host.
        <Image
          src={url}
          alt=""
          width={96}
          height={96}
          unoptimized
          className="h-24 w-24 rounded-md border border-slate-200 object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-slate-300 text-xs text-slate-400">
          Görsel yok
        </div>
      )}

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {busy ? 'Yükleniyor…' : value ? 'Değiştir' : 'Görsel yükle'}
          </button>
          {value ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onChange(null);
                setUrl(null);
              }}
              className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:text-red-600"
            >
              Kaldır
            </button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
