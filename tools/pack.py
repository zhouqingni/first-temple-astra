#!/usr/bin/env python3
"""Compile a portable, network-free HTML from the editable source. No build dependencies."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
s=(root/'index.html').read_text()
s=s.replace('<link rel="stylesheet" href="src/atlas.css">','<style>\n'+(root/'src/atlas.css').read_text()+'\n</style>')
def inline(m):
    path=m.group(1);source=(root/path).read_text().replace('</script','<\\/script')
    if path.startswith('vendor/'):
        source='/*\n'+(root/'vendor/THREE-LICENSE.txt').read_text()+'\n*/\n'+source
    return '<script>\n'+source+'\n</script>'
s=re.sub(r'<script src="([^"]+)"></script>',inline,s)
assert '<script src=' not in s
out=root/'开始探索.html';out.write_text(s)
print(out.name, f'{out.stat().st_size:,} bytes')
