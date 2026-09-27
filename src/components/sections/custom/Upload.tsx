import { useRef } from 'react';
import { MAX_PHOTOS, MAX_PHOTO_BYTES } from '../../../data/custom';
import { ACCEPTED_INPUT } from '../../../lib/image';

export type Shot = { id: string; file: File; preview: string | null };

const PREVIEWABLE = ['image/jpeg', 'image/png', 'image/webp'];

/** Adds files to the list (max 3, images only, 10 MB each) and says why anything was refused. */
export function addShots(current: Shot[], files: File[]): { shots: Shot[]; error: string } {
  const next: Shot[] = [];
  let error = '';
  for (const file of files) {
    if (current.length + next.length >= MAX_PHOTOS) {
      error = `Up to ${MAX_PHOTOS} photos.`;
      break;
    }
    const name = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || name.endsWith('.heic') || name.endsWith('.heif');
    if (!isImage) {
      error = 'JPG, PNG or HEIC photos only.';
      continue;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      error = 'Each photo must be under 10 MB.';
      continue;
    }
    next.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file, preview: PREVIEWABLE.includes(file.type) ? URL.createObjectURL(file) : null });
  }
  return { shots: [...current, ...next].slice(0, MAX_PHOTOS), error };
}

export function Upload({ shots, error, onAdd, onRemove }: { shots: Shot[]; error: string; onAdd(files: File[]): void; onRemove(id: string): void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      className="mt-lg rounded border border-dashed border-cocoa-15 p-md"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onAdd(Array.from(e.dataTransfer.files));
      }}
    >
      <p className="t-label text-cocoa-70">Add up to {MAX_PHOTOS} inspiration photos</p>
      <div className="mt-sm flex flex-wrap items-center gap-sm">
        {shots.map((s) => (
          <div key={s.id} className="relative size-[88px] overflow-hidden rounded bg-rose">
            {s.preview ? <img src={s.preview} alt="" className="size-full object-cover" /> : <span className="t-label absolute inset-0 grid place-items-center text-cocoa">HEIC</span>}
            <button type="button" onClick={() => onRemove(s.id)} className="t-price absolute right-2xs top-2xs grid size-[28px] place-items-center rounded bg-butter text-cocoa" aria-label="Remove photo">
              ×
            </button>
          </div>
        ))}
        {shots.length < MAX_PHOTOS && (
          <button type="button" onClick={() => input.current?.click()} className="chip">
            Add photos
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept={ACCEPTED_INPUT}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Add photos"
          onChange={(e) => {
            if (e.target.files) onAdd(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
      </div>
      <p className="t-caption mt-xs text-cocoa-70">Or drop them here. JPG, PNG or HEIC, up to 10 MB each.</p>
      {error && (
        <p role="alert" className="t-caption mt-xs text-cocoa">
          {error}
        </p>
      )}
    </div>
  );
}
