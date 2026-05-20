#!/usr/bin/env python3
"""전역 이름 충돌 검사기.

빌드 도구 없이 모든 *.jsx가 하나의 전역 스코프를 공유하므로,
서로 다른 파일에 같은 이름의 top-level `function`/`const`가 있으면
나중에 로드된 정의가 먼저 것을 덮어써 조용히 버그를 만든다.

이 스크립트는 그런 중복을 찾아 0이 아니면 실패(exit 1)한다.
  python3 check-collisions.py
"""

import re
import sys
import glob
import os
from collections import defaultdict

# 파일 스코프가 따로 없는 전역 선언만 대상 (열 0에서 시작하는 선언)
FUNC_RE = re.compile(r"^function ([A-Za-z_][A-Za-z0-9_]*)", re.M)
CONST_RE = re.compile(r"^const ([A-Za-z_][A-Za-z0-9_]*)\s*=", re.M)


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    defs = defaultdict(list)  # name -> [files]

    for path in sorted(glob.glob("*.jsx")):
        with open(path, encoding="utf-8") as f:
            src = f.read()
        for name in FUNC_RE.findall(src) + CONST_RE.findall(src):
            defs[name].append(path)

    collisions = {n: fs for n, fs in defs.items() if len(fs) > 1}

    if not collisions:
        print(f"OK — 전역 이름 충돌 없음 ({len(defs)}개 top-level 선언 검사)")
        return

    print("✗ 전역 이름 충돌 발견 — 같은 이름이 여러 파일에 정의됨:\n", file=sys.stderr)
    for name in sorted(collisions):
        print(f"  {name}", file=sys.stderr)
        for fpath in collisions[name]:
            print(f"      - {fpath}", file=sys.stderr)
    print(
        "\n해결: 화면 전용 헬퍼는 고유 접두사를 붙이세요 "
        "(예: NP*, Chart*, Rx*, Collect*). 공용 컴포넌트는 Components.jsx에 둡니다.",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    main()
