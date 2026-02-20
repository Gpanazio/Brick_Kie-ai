import re

html_file = "/Users/gabrielpanazio/BRICK TODOS PROJETOS/Brick_Marketing/kie-ai/frontend/index.html"
with open(html_file, "r") as f:
    content = f.read()

# Ideogram logo
ideogram_svg = """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M5 5h14v14H5z" fill="currentColor"/></svg>""" # Simplified placeholder, better to use real or styled text "i" with the colorful squares
ideogram_svg = """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-weight="900" font-family="sans-serif" font-size="12" fill="currentColor">i</text></svg>"""

# Using explicit generic or simple SVGs for the models requested until actual SVGs are provided, to fulfill the "replace initials with logos" request.

svgs = {
    "ideogram": """<svg viewBox="0 0 40 40" fill="none" class="brand-logo-svg"><rect x="4" y="4" width="8" height="8" fill="#FF3B30"/><rect x="16" y="4" width="8" height="8" fill="#FF9500"/><rect x="28" y="4" width="8" height="8" fill="#FFCC00"/><rect x="4" y="16" width="8" height="8" fill="#4CD964"/><rect x="16" y="16" width="8" height="8" fill="#5AC8FA"/><rect x="28" y="16" width="8" height="8" fill="#007AFF"/><rect x="4" y="28" width="8" height="8" fill="#5856D6"/><rect x="16" y="28" width="8" height="8" fill="#FF2D55"/><rect x="28" y="28" width="8" height="8" fill="#8E8E93"/></svg>""",
    "qwen": """<svg viewBox="0 0 40 40" fill="none" class="brand-logo-svg"><circle cx="20" cy="20" r="16" stroke="#7B61FF" stroke-width="4"/><path d="M14 20l4 4 8-8" stroke="#7B61FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>""",
    "flux": """<svg viewBox="0 0 40 40" fill="none" class="brand-logo-svg"><path d="M8 8h24v8H20v16h-4V16H8z" fill="#000" stroke="#fff" stroke-width="1"/></svg>""",
    "sora": """<svg viewBox="0 0 40 40" fill="none" class="brand-logo-svg"><circle cx="20" cy="20" r="14" fill="#10A37F"/></svg>""",
    "kling": """<svg viewBox="0 0 40 40" fill="none" class="brand-logo-svg"><path d="M10 30L20 10l10 20z" fill="#00C4B6"/></svg>""",
    "mj": """<svg viewBox="0 0 40 40" fill="none" class="brand-logo-svg"><path d="M10 20c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10-10-4.48-10-10z" stroke="#fff" stroke-width="3"/><path d="M15 20c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5z" fill="#fff"/></svg>"""
}

# Add data-logo attribute with SVG
def replace_icon(match):
    full_match = match.group(0)
    provider = match.group(1).lower()
    
    logo = ""
    color_class = match.group(2)
    
    if "ideogram" in provider or "id" in provider:
        logo = svgs["ideogram"]
        color_class = "mc-ideogram"
    elif "qwen" in provider:
        logo = svgs["qwen"]
        color_class = "mc-qwen"
    elif "flux" in provider:
        logo = svgs["flux"]
        color_class = "mc-flux"
    elif "sora" in provider or "openai" in provider:
        logo = svgs["sora"]
        color_class = "mc-openai"
    elif "kling" in provider:
        logo = svgs["kling"]
        color_class = "mc-kling"
    elif "midjourney" in provider or "mj" in provider:
        logo = svgs["mj"]
        color_class = "mc-mj"
        
    return full_match.replace('data-icon="'+match.group(3)+'"', f"data-icon='{logo}'").replace(f'data-color="{match.group(2)}"', f'data-color="{color_class}"')

# regex to find the elements in the template
pattern = r'<div[^>]*data-provider="([^"]*)"[^>]*data-color="([^"]*)"[^>]*data-icon="([^"]*)"[^>]*>'

new_content = re.sub(pattern, replace_icon, content)

with open(html_file, "w") as f:
    f.write(new_content)
print("Updated index.html")
