import sys

file_path = "/Users/gabrielpanazio/BRICK TODOS PROJETOS/Brick_Marketing/kie-ai/frontend/style-v2.css"

with open(file_path, "r") as f:
    orig_content = f.read()

# We only want to replace stuff in the V2 WORKSPACE section which starts at .v2-ws
split_idx = orig_content.find('.v2-ws {')
if split_idx == -1:
    print("Could not find .v2-ws {")
    sys.exit(1)

content_before = orig_content[:split_idx]
content_after = orig_content[split_idx:]

replacements = [
    ('rgba(96, 165, 250', 'rgba(220, 38, 38'),   # blue-400
    ('rgba(59, 130, 246', 'rgba(220, 38, 38'),   # blue-500
    ('rgba(139, 92, 246', 'rgba(220, 38, 38'),   # violet-500
    ('rgba(99, 102, 241', 'rgba(220, 38, 38'),   # indigo-500
    ('#60a5fa', '#DC2626'),
    ('#3b82f6', '#DC2626'),
    ('#93c5fd', '#DC2626'),
    ('#6366f1', '#b91c1c')
]

for old_s, new_s in replacements:
    content_after = content_after.replace(old_s, new_s)

new_content = content_before + content_after

with open(file_path, "w") as f:
    f.write(new_content)

print("Replaced colors successfully!")
