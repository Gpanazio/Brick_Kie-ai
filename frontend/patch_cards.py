import sys
import re

file_path = "/Users/gabrielpanazio/BRICK TODOS PROJETOS/Brick_Marketing/kie-ai/frontend/style-v2.css"

with open(file_path, "r") as f:
    orig_content = f.read()

new_content = orig_content

# We want to replace the slate backgrounds with neutral dark backgrounds.
replacements = [
    # Mpm cards (Model Picker Cards)
    (r'.mpm-card {[^}]+background: var\(--surface-2\);', '.mpm-card {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    gap: 14px;\n    padding: 20px;\n    padding-top: 22px;\n    background: rgba(18, 18, 18, 0.5);\n'),
    
    # Task cards & History cards
    (r'.task-card {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    background: var\(--surface\);', 
     '.task-card {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    background: rgba(18, 18, 18, 0.5);'),

    (r'.history-card {\n    display: flex;\n    flex-direction: column;\n    background: var\(--surface-2\);', 
     '.history-card {\n    display: flex;\n    flex-direction: column;\n    background: rgba(18, 18, 18, 0.5);'),

    # Task results grid
    (r'.task-result-grid-img {\n    width: 100%;\n    height: 100%;\n    object-fit: contain;\n    background: var\(--surface-2\);',
     '.task-result-grid-img {\n    width: 100%;\n    height: 100%;\n    object-fit: contain;\n    background: rgba(15, 15, 15, 0.5);'),
     
     (r'background: var\(--surface-2\);[^}]*border: 1px solid var\(--border\);[^}]*border-radius: 6px;',
      'background: rgba(18, 18, 18, 0.5); border: 1px solid var(--border); border-radius: 10px;'),
     
    # Remove purple shades on :hover on the cards
    (r'border-color: var\(--accent\);\n    background: var\(--surface-2\);', 
     'border-color: rgba(220, 38, 38, 0.3);\n    background: rgba(24, 24, 24, 0.8);'),

    (r'border-color: var\(--border-hover\);\n    background: var\(--surface-3\);',
     'border-color: rgba(220, 38, 38, 0.3);\n    background: rgba(24, 24, 24, 0.8);'),
]

for old_s, new_s in replacements:
    new_content = re.sub(old_s, new_s, new_content)

# Update Slate colors leftover
new_content = new_content.replace('rgba(15, 23, 42,', 'rgba(15, 15, 15,')
# Make the old #app-main use the black background
new_content = new_content.replace('background: var(--bg);', 'background: var(--bg);') # bg is #000000 already

with open(file_path, "w") as f:
    f.write(new_content)

print("Applied V2 cards aesthetic globally!")
