import os
import re

ROOT_DIR = '/Users/ankumar/basal'
EXCLUDE_DIRS = {'.git', 'node_modules', '.next', '__pycache__', 'venv', '.venv', '.idea', '.vscode'}
EXCLUDE_FILES = {'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'rename_script.py'}

def replace_text_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return False
    except FileNotFoundError:
        return False

    new_content = content
    # Case-sensitive replacements
    new_content = re.sub(r'basal', 'statis', new_content)
    new_content = re.sub(r'Basal', 'Statis', new_content)
    new_content = re.sub(r'BASAL', 'STATIS', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated text in: {filepath}")
        return True
    return False

def get_new_name(basename):
    new_basename = basename
    new_basename = re.sub(r'basal', 'statis', new_basename)
    new_basename = re.sub(r'Basal', 'Statis', new_basename)
    new_basename = re.sub(r'BASAL', 'STATIS', new_basename)
    return new_basename

# 1. Text Replacement
files_modified = 0
for root, dirs, files in os.walk(ROOT_DIR):
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
    for file in files:
        if file in EXCLUDE_FILES or file.endswith(('.pyc', '.png', '.jpg', '.jpeg', '.woff', '.woff2', '.ico', '.pdf', '.mp4')):
            continue
        filepath = os.path.join(root, file)
        if replace_text_in_file(filepath):
            files_modified += 1

print(f"\nReplaced text in {files_modified} files.\n")

# 2. File and Directory Renaming
# Gather all paths first to properly apply exclusions, then rename longest paths (children) first.
paths_to_rename = []
for root, dirs, files in os.walk(ROOT_DIR):
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
    for name in files + dirs:
        if name in EXCLUDE_FILES:
            continue
        paths_to_rename.append(os.path.join(root, name))

# Sort by length descending, so children are renamed before their parents
paths_to_rename.sort(key=len, reverse=True)

renamed_count = 0
for path in paths_to_rename:
    if not os.path.exists(path):
        continue
    dirname, basename = os.path.split(path)
    if 'basal' in basename.lower():
        new_basename = get_new_name(basename)
        new_path = os.path.join(dirname, new_basename)
        
        # Don't rename the root project dir
        if path == ROOT_DIR:
            continue
            
        os.rename(path, new_path)
        print(f"Renamed: {path} -> {new_path}")
        renamed_count += 1

print(f"\nRenamed {renamed_count} files/directories.\n")
