from PIL import Image, ImageDraw, ImageFont
import os

width = 1200
height = 630

img = Image.new("RGBA", (width, height), (13, 17, 23, 255))
draw = ImageDraw.Draw(img)

# Gradient background simulation
for y in range(height):
    ratio = y / height
    r = int(10 + (2 - 10) * ratio)
    g = int(15 + (6 - 15) * ratio)
    b = int(24 + (23 - 24) * ratio)
    draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

# Draw subtle grid lines
for x in range(0, width, 100):
    draw.line([(x, 0), (x, height)], fill=(30, 41, 59, 80), width=1)
for y in range(0, height, 80):
    draw.line([(0, y), (width, y)], fill=(30, 41, 59, 80), width=1)

# Outer border
draw.rounded_rectangle([10, 10, width - 10, height - 10], radius=24, outline=(56, 189, 248, 120), width=2)

# Glow orbs
# Blue top left
draw.ellipse([80, 80, 400, 400], fill=(56, 189, 248, 25))
# Purple bottom right
draw.ellipse([800, 250, 1150, 600], fill=(168, 85, 247, 25))

# Attempt to load fonts
try:
    font_large = ImageFont.truetype("/System/Library/Fonts/SFProText-Bold.otf", 56)
    font_title = ImageFont.truetype("/System/Library/Fonts/SFProText-Bold.otf", 34)
    font_sub = ImageFont.truetype("/System/Library/Fonts/SFProText-Regular.otf", 24)
    font_badge = ImageFont.truetype("/System/Library/Fonts/SFProText-Medium.otf", 18)
    font_tag = ImageFont.truetype("/System/Library/Fonts/SFProText-Bold.otf", 16)
except Exception:
    font_large = ImageFont.load_default()
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_badge = ImageFont.load_default()
    font_tag = ImageFont.load_default()

# Logo Box
draw.rounded_rectangle([100, 90, 190, 180], radius=20, fill=(30, 41, 59, 255), outline=(56, 189, 248, 255), width=2)
draw.text((120, 105), "{ }", fill=(56, 189, 248, 255), font=font_large)

# Tag & Brand Title
draw.text((220, 105), "DEVELOPER TOOL SUITE", fill=(56, 189, 248, 255), font=font_tag)
draw.text((220, 132), "JSON Studio", fill=(255, 255, 255, 255), font=font_title)

# Main Headline
draw.text((100, 240), "The Modern JSON Powerhouse", fill=(248, 250, 252, 255), font=font_large)
draw.text((100, 320), "Viewer • Diff Comparer • Schema Validator • JSONPath • Auto-Repair", fill=(148, 163, 184, 255), font=font_sub)

# Badges
badges = [
    ("⚡ Ultra Fast", (56, 189, 248, 255)),
    ("🔒 100% Client-Side", (129, 140, 248, 255)),
    ("✨ Auto-Repair", (52, 211, 153, 255)),
    ("🛠️ TS / YAML / CSV / XML", (244, 114, 182, 255)),
]

x_offset = 100
for text, color in badges:
    badge_w = len(text) * 11 + 30
    draw.rounded_rectangle([x_offset, 400, x_offset + badge_w, 450], radius=12, fill=(30, 41, 59, 220), outline=(51, 65, 85, 255), width=1)
    draw.text((x_offset + 15, 415), text, fill=color, font=font_badge)
    x_offset += badge_w + 16

# Footer line & domain
draw.line([(100, 520), (1100, 520)], fill=(51, 65, 85, 200), width=1)
draw.text((100, 550), "jsonstudio-app.web.app", fill=(100, 116, 139, 255), font=font_sub)
draw.text((800, 550), "Free & Private Developer Tool", fill=(100, 116, 139, 255), font=font_sub)

# Convert to RGB and save PNG
rgb_img = img.convert("RGB")
os.makedirs("/Users/technonext/Documents/json_viewer/public", exist_ok=True)
rgb_img.save("/Users/technonext/Documents/json_viewer/public/og-image.png", "PNG", optimize=True)
print("Saved og-image.png successfully (1200x630)")
