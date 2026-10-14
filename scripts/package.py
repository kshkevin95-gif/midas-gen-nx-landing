"""Bundle editable source and completed media, excluding caches and dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
target=root/'exports/gen_teaser_source.zip'
with ZipFile(target,'w',ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(root.rglob('*')):
        rel=p.relative_to(root)
        if not p.is_file() or p==target or p.name=='gen_teaser_preview.html' or any(x in {'.git','node_modules','.render'} for x in rel.parts):continue
        z.write(p,Path('gen-nx-teaser')/rel)
print(target)
