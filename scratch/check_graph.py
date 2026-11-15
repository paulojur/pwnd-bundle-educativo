import os
import re

def get_imports(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # matches: import ... from '...' or export ... from '...' or import '...'
    patterns = [
        r'''import\s+.*?\s+from\s+['"]([^'"]+)['"]''',
        r'''import\s+['"]([^'"]+)['"]''',
        r'''export\s+.*?\s+from\s+['"]([^'"]+)['"]''',
    ]
    imports = set()
    for p in patterns:
        for m in re.finditer(p, content, re.DOTALL):
            imports.add(m.group(1))
    return sorted(list(imports))

def resolve_import(curr_file, imp):
    if not imp.startswith('.'):
        return None
    curr_dir = os.path.dirname(curr_file)
    cand = os.path.normpath(os.path.join(curr_dir, imp))
    for ext in ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '.css']:
        target = cand + ext
        if os.path.isfile(target):
            return os.path.normpath(target).replace('\\', '/')
    return None

def build_graph(root_files):
    visited = set()
    queue = list(root_files)
    graph = {}

    while queue:
        curr = queue.pop(0)
        curr = os.path.normpath(curr).replace('\\', '/')
        if curr in visited:
            continue
        visited.add(curr)
        imps = get_imports(curr)
        resolved = []
        for imp in imps:
            r = resolve_import(curr, imp)
            if r:
                resolved.append(r)
                if r not in visited:
                    queue.append(r)
        graph[curr] = resolved
    return visited, graph

# Check runtime reachable from App (which renders LanguageProvider and BoardGameMain)
runtime_roots = ['src/components/BoardGameMain.tsx', 'src/i18n/LanguageContext.tsx']
runtime_visited, runtime_graph = build_graph(runtime_roots)

print('=== RUNTIME REACHABLE FILES ===')
for f in sorted(runtime_visited):
    print(f)

# Check all files in src
all_src = []
for root, _, files in os.walk('src'):
    for f in files:
        all_src.append(os.path.normpath(os.path.join(root, f)).replace('\\', '/'))

print('\n=== SRC FILES NOT IN RUNTIME REACHABLE ===')
dead = set(all_src) - runtime_visited
for f in sorted(dead):
    print(f)

