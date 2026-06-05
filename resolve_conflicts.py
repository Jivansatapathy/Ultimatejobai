"""Resolve all git merge conflicts by keeping the HEAD (<<<<<<< HEAD) side."""
import os
import re

SRC = r"c:\Users\Debasish Sadangi\OneDrive\Desktop\Developer\JOB\Ultimatejobai\src"

CONFLICT_RE = re.compile(
    r"<<<<<<< HEAD\n(.*?)=======\n.*?>>>>>>> [^\n]+\n",
    re.DOTALL,
)

def resolve_file(path):
    with open(path, encoding="utf-8") as f:
        content = f.read()
    if "<<<<<<< HEAD" not in content:
        return False
    resolved = CONFLICT_RE.sub(lambda m: m.group(1), content)
    with open(path, "w", encoding="utf-8") as f:
        f.write(resolved)
    return True

fixed = []
for root, dirs, files in os.walk(SRC):
    for fname in files:
        if fname.endswith((".tsx", ".ts", ".js", ".jsx", ".css")):
            path = os.path.join(root, fname)
            if resolve_file(path):
                fixed.append(path.replace(SRC, "src"))

print(f"Resolved conflicts in {len(fixed)} files:")
for f in fixed:
    print(" ", f)
