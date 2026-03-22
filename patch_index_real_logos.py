import re

html_file = "/Users/gabrielpanazio/BRICK TODOS PROJETOS/Brick_Marketing/kie-ai/frontend/index.html"
with open(html_file, "r") as f:
    content = f.read()

svgs = {
    # Nano Banana Pro
    "k-nano": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg>""",
    
    # ByteDance / Seedream (A stylized wave or abstract spark)
    "bytedance": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M19 12h-3c-1.1 0-2-.9-2-2V7c0-1.1-.9-2-2-2S10 5.9 10 7v3c0 1.1-.9 2-2 2H5c-1.1 0-2 .9-2 2s.9 2 2 2h3c1.1 0 2 .9 2 2v3c0 1.1.9 2 2 2s2-.9 2-2v-3c0-1.1.9-2 2-2h3c1.1 0 2-.9 2-2s-.9-2-2-2z" fill="currentColor"/></svg>""",
    
    # Flux (Black Forest Labs - simple bold cross or 'F' abstract)
    "flux": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M5 5h14v3H9v3h8v3H9v5H5V5z" fill="currentColor"/></svg>""",
    
    # Ideogram
    "ideogram": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M7 4h2v16H7zm8 0h2v16h-2zm-4 4h2v8h-2z" fill="currentColor"/></svg>""",
    
    # Qwen (A stylized Q or star)
    "qwen": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" fill="currentColor"/></svg>""",
    
    # OpenAI / Sora
    "openai": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zM12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8zm-2 12h4v1h-4zm0-3h4v1h-4zm0-3h4v1h-4z" fill="currentColor"/></svg>""",
    
    # Kling
    "kling": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13z" fill="currentColor"/></svg>""",
    
    # Wan
    "wan": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M5 5l4 14 3-8 3 8 4-14h-2.5l-2.5 9-3-8-3 8-2.5-9z" fill="currentColor"/></svg>""",
    
    # xAI / Grok
    "grok": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M4 4l6 8-6 8h3l4.5-6L16 20h3l-6-8 6-8h-3l-4.5 6L7 4z" fill="currentColor"/></svg>""",
    
    # Hailuo
    "hailuo": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-11.5v7l6-3.5z" fill="currentColor"/></svg>""",

    # ElevenLabs
    "elevenlabs": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M6 10v4M10 6v12M14 8v8M18 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>""",
    
    # Inifinitalk
    "infini": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>""",
    
    # Suno
    "suno": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10S22 17.52 22 12c0-.34-.02-.67-.06-1h-2.02c.05.33.08.66.08 1 0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8c1.69 0 3.24.53 4.54 1.44l1.52-1.25A9.95 9.95 0 0012 2zm7 3l-1.5 3L13 9l4.5 1.5L19 15l1.5-4.5L25 9l-4.5-1.5z" fill="currentColor"/></svg>""",
    
    # Recraft
    "recraft": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M6 6h12v12H6z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>""",
    
    # Topaz
    "topaz": """<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2l-6 10h12zM5 14l7 8 7-8z" fill="currentColor"/></svg>""",

}

def replace_icon(match):
    full_match = match.group(0)
    provider = match.group(1).lower()
    
    logo = ""
    # We leave color alone since we already mapped it
    
    if "nano banana" in provider or "kie" in provider: logo = svgs["k-nano"]
    elif "ideogram" in provider or "id" in provider: logo = svgs["ideogram"]
    elif "qwen" in provider: logo = svgs["qwen"]
    elif "flux" in provider: logo = svgs["flux"]
    elif "sora" in provider or "openai" in provider: logo = svgs["openai"]
    elif "kling" in provider: logo = svgs["kling"]
    elif "wan" in provider: logo = svgs["wan"]
    elif "xai" in provider or "grok" in provider: logo = svgs["grok"]
    elif "hailuo" in provider: logo = svgs["hailuo"]
    elif "eleven" in provider: logo = svgs["elevenlabs"]
    elif "infini" in provider: logo = svgs["infini"]
    elif "suno" in provider: logo = svgs["suno"]
    elif "recraft" in provider: logo = svgs["recraft"]
    elif "topaz" in provider: logo = svgs["topaz"]

    # Replaces whatever is in 'data-icon="..." ' with the proper SVG
    # We use a regex over the full match to strip current data-icon and inject the new one
    icon_pattern = r'data-icon="([^"]*?)"'
    # single quotes edgecase from the previous patch
    icon_pattern2 = r"data-icon='([^']*?)'"
    
    if re.search(icon_pattern, full_match):
        new_match = re.sub(icon_pattern, f'data-icon="{logo.replace('"', "&quot;")}"', full_match)
    elif re.search(icon_pattern2, full_match):
        new_match = re.sub(icon_pattern2, f'data-icon="{logo.replace('"', "&quot;")}"', full_match)
    else:
        new_match = full_match
        
    return new_match

pattern = r'<div[^>]*data-provider="([^"]*)"[^>]*>'

new_content = re.sub(pattern, replace_icon, content)

with open(html_file, "w") as f:
    f.write(new_content)
print("Updated index.html SVGs globally.")
