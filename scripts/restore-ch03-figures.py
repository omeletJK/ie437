#!/usr/bin/env python3
"""Re-extract the audited original Lecture 3 figures (requires PyMuPDF).

Run from any directory. The private original PDF must be present locally;
regular site builds only need the committed SVG assets, not PyMuPDF or the PDF.
"""
from pathlib import Path
import hashlib
import json
import re
import fitz

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'md/_source/ch03_visual_restoration.json').read_text())
source = root / manifest['source']['path']
if hashlib.sha256(source.read_bytes()).hexdigest() != manifest['source']['sha256']:
    raise SystemExit('Source PDF changed: review the crop coordinates before extracting.')
with fitz.open(source) as document:
    for entry in manifest['assets']:
        page_number = entry['source_page'] - 1
        with fitz.open() as copy, fitz.open() as cropped:
            copy.insert_pdf(document, from_page=page_number, to_page=page_number)
            page = copy[0]
            for rectangle, point, label, font, size in entry['patches']:
                page.draw_rect(fitz.Rect(rectangle), color=None, fill=(1, 1, 1), overlay=True)
                if label:
                    page.insert_text(point, label, fontname=font, fontsize=size,
                                     color=(0, 0, 0), overlay=True)
            clip = fitz.Rect(entry['crop_points'])
            output = cropped.new_page(width=clip.width, height=clip.height)
            output.show_pdf_page(output.rect, copy, 0, clip=clip)
            svg = output.get_svg_image(text_as_path=True)
            width = manifest['svg_intrinsic_width']
            svg = re.sub(r'width="[^"]+" height="[^"]+"',
                         f'width="{width}" height="{width * clip.height / clip.width:.6f}"',
                         svg, count=1)
            (root / entry['asset']).write_text(svg)
print(f"Extracted {len(manifest['assets'])} original figure regions.")
