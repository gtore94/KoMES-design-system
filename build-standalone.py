#!/usr/bin/env python3
"""Rebuilds index.standalone.html by inlining all JSX files from index.html."""

import re
import sys
import os

SRC = "index.html"
OUT = "index.standalone.html"


def jsx_files_from_index(html):
    """index.html의 <script src="*.jsx"> 를 로드 순서대로 추출(중복/?v= 제거)."""
    ordered = []
    for ref in re.findall(r'src="([^"]+\.jsx)', html):
        name = ref.split("?")[0]
        if name not in ordered:
            ordered.append(name)
    return ordered


def check_collisions():
    """전역 이름 충돌이 있으면 빌드를 중단한다."""
    import subprocess
    r = subprocess.run([sys.executable, "check-collisions.py"])
    if r.returncode != 0:
        print("\n빌드 중단: 전역 이름 충돌을 먼저 해결하세요.", file=sys.stderr)
        sys.exit(1)


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    check_collisions()

    with open(SRC) as f:
        html = f.read()

    # Head: everything before first external babel script
    head_end = html.index('<script type="text/babel" src=')
    head = html[:head_end].replace("KoMES — UI Kit", "KoMES — UI Kit (Standalone)")

    # Inline external CSS — standalone has no external links.
    css_link_re = re.compile(r'<link\s+rel="stylesheet"\s+href="([^"]+\.css)"\s*/?>')
    def inline_css(m):
        css_path = m.group(1)
        if not os.path.exists(css_path):
            print(f"  ✗  MISSING CSS: {css_path}", file=sys.stderr)
            return m.group(0)
        with open(css_path) as cf:
            print(f"  ✓  inlined CSS: {css_path}")
            return f"<style>\n{cf.read()}\n</style>"
    head = css_link_re.sub(inline_css, head)

    # App script: last inline <script type="text/babel"> block
    last = html.rindex('<script type="text/babel">')
    app_script = html[last : html.index("</script>", last) + len("</script>")]

    # JSX 목록은 index.html의 로드 순서에서 직접 도출 (하드코딩하지 않음)
    jsx_files = jsx_files_from_index(html)

    parts = [head, "\n"]
    ok = err = 0
    for fname in jsx_files:
        if os.path.exists(fname):
            with open(fname) as f:
                content = f.read()
            parts.append(f'<script type="text/babel">\n{content}\n</script>\n\n')
            print(f"  ✓  {fname}")
            ok += 1
        else:
            print(f"  ✗  MISSING: {fname}", file=sys.stderr)
            err += 1

    parts.append(app_script)
    parts.append("\n</body>\n</html>\n")

    with open(OUT, "w") as f:
        f.write("".join(parts))

    size_kb = os.path.getsize(OUT) // 1024
    print(f"\n{'OK' if not err else 'DONE WITH ERRORS'} — {ok} files inlined, {OUT} ({size_kb} KB)")
    if err:
        sys.exit(1)

if __name__ == "__main__":
    main()
