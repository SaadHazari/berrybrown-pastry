#!/usr/bin/env python3
"""Grade photos into the Berry Brown palette and write the WebP pairs the site loads.

  python3 scripts/grade-photos.py <raw-dir>          grade every <slot>.jpg / <slot>.png listed in scripts/photo-slots.json
  python3 scripts/grade-photos.py <raw-dir> --real   crop and resize only (real photos keep their own colour)

Writes public/images/ai/<slot>-640.webp and <slot>-1200.webp, rewrites src/data/photos.generated.ts
with every slot that has both files, and saves <raw-dir>/contact-sheet.jpg to check the set by eye.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'images' / 'ai'
MANIFEST = ROOT / 'src' / 'data' / 'photos.generated.ts'
SLOTS = json.loads((ROOT / 'scripts' / 'photo-slots.json').read_text())
BUTTER = (246, 238, 223)
COCOA = (62, 42, 33)
MID = (170, 138, 124)
WIDTHS = (640, 1200)


def crop_to(im, ratio):
    rw, rh = (int(x) for x in ratio.split(':'))
    w, h = im.size
    target = rw / rh
    if w / h > target:
        nw = round(h * target)
        left = (w - nw) // 2
        return im.crop((left, 0, left + nw, h))
    nh = round(w / target)
    top = (h - nh) // 2
    return im.crop((0, top, w, top + nh))


def grade(im):
    """Split-tone toward Cocoa shadows and Butter highlights, calm the colour, lift the blacks a little."""
    toned = ImageOps.colorize(ImageOps.grayscale(im), black=COCOA, white=BUTTER, mid=MID)
    im = Image.blend(im, toned, 0.22)
    im = ImageEnhance.Color(im).enhance(0.94)
    return im.point(lambda v: round(10 + v * 245 / 255))


def export(slot, im):
    OUT.mkdir(parents=True, exist_ok=True)
    for w in WIDTHS:
        tw = min(w, im.width)
        th = round(im.height * tw / im.width)
        im.resize((tw, th), Image.LANCZOS).save(OUT / f'{slot}-{w}.webp', 'WEBP', quality=80, method=6)


def write_manifest():
    ready = sorted(s['slot'] for s in SLOTS if all((OUT / f"{s['slot']}-{w}.webp").exists() for w in WIDTHS))
    lines = ''.join(f"  '{slot}',\n" for slot in ready)
    MANIFEST.write_text(
        '// Written by scripts/grade-photos.py. Slots with files in public/images/ai.\n'
        f'export const READY_PHOTOS: readonly string[] = [\n{lines}];\n'
    )
    return ready


def contact_sheet(raw_dir, slots):
    if not slots:
        return
    cell, cols = 200, 8
    rows = (len(slots) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell, rows * cell), BUTTER)
    for i, slot in enumerate(slots):
        thumb = Image.open(OUT / f'{slot}-640.webp').convert('RGB')
        thumb.thumbnail((cell - 8, cell - 8))
        sheet.paste(thumb, ((i % cols) * cell + 4, (i // cols) * cell + 4))
    sheet.save(raw_dir / 'contact-sheet.jpg', quality=85)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        sys.exit(__doc__)
    raw = Path(args[0])
    real = '--real' in sys.argv
    done = []
    for s in SLOTS:
        src = next((p for p in (raw / f"{s['slot']}.jpg", raw / f"{s['slot']}.png") if p.exists()), None)
        if src is None:
            continue
        im = crop_to(Image.open(src).convert('RGB'), s['ratio'])
        export(s['slot'], im if real else grade(im))
        done.append(s['slot'])
    ready = write_manifest()
    contact_sheet(raw, done)
    print(f'graded {len(done)} photos; {len(ready)} slots ready')


if __name__ == '__main__':
    main()
